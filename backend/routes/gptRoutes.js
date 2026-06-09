const express = require("express");
const router = express.Router();
const {
  EmployeeMaster,
  EmpOfficial,
  User,
  LeaveDetails,
  Holiday,
  Attendance,
  LeaveApplication,
  LeavePosition,
  SalaryRegister,
  EmpSalary,
  OnDutyApplication,
  TourApplication
} = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { NlpManager } = require("node-nlp");

// 1. Initialize NLP Manager
const manager = new NlpManager({ languages: ["en"], forceNER: true });

// 2. Training Data
// --- Greetings ---
manager.addDocument("en", "hello", "greeting.hello");
manager.addDocument("en", "hi", "greeting.hello");
manager.addDocument("en", "good morning", "greeting.hello");
manager.addDocument("en", "bye", "greeting.bye");
manager.addDocument("en", "goodbye", "greeting.bye");
manager.addDocument("en", "thank you", "greeting.thanks");
manager.addDocument("en", "thanks", "greeting.thanks");

// --- Navigation ---
manager.addDocument("en", "go to leave", "navigation.goto");
manager.addDocument("en", "open tour", "navigation.goto");
manager.addDocument("en", "apply for onduty", "navigation.goto");
manager.addDocument("en", "take me to payroll", "navigation.goto");
manager.addDocument("en", "show me employees", "navigation.goto");
manager.addDocument("en", "open shift change", "navigation.goto");

// --- On Duty ---
manager.addDocument("en", "onduty application", "onduty.apply");
manager.addDocument("en", "apply for onduty permission", "onduty.apply");
manager.addDocument("en", "on duty application form", "onduty.apply");
manager.addDocument("en", "i need on duty permission", "onduty.apply");

// --- Tour ---
manager.addDocument("en", "apply for tour", "tour.apply");
manager.addDocument("en", "tour application form", "tour.apply");
manager.addDocument("en", "register tour", "tour.apply");
manager.addDocument("en", "business trip form", "tour.apply");

// --- Holidays ---
manager.addDocument("en", "when is the next holiday", "holiday.next");
manager.addDocument("en", "upcoming holidays", "holiday.next");
manager.addDocument("en", "is tomorrow a holiday", "holiday.next");

// --- Attendance ---
manager.addDocument("en", "who is late today", "attendance.late");
manager.addDocument("en", "list late comers", "attendance.late");
manager.addDocument("en", "attendance status", "attendance.status");
manager.addDocument("en", "how many present today", "attendance.status");

// --- Leaves ---
manager.addDocument("en", "who is on leave", "leave.status");
manager.addDocument("en", "list absent employees", "leave.status");
manager.addDocument("en", "how to apply for leave", "leave.apply");
manager.addDocument("en", "apply leave for me", "leave.apply");
manager.addDocument("en", "can you apply behalf of mine", "leave.apply");
manager.addDocument("en", "apply for leave", "leave.apply");
manager.addDocument("en", "i want to take a break", "leave.apply");
manager.addDocument("en", "pending leave applications", "leave.pending");

// --- Salary ---
manager.addDocument("en", "what is my salary", "salary.personal");
manager.addDocument("en", "show my earnings", "salary.personal");
manager.addDocument("en", "payslip details", "salary.personal");

// --- Help ---
manager.addDocument("en", "help me", "help.general");
manager.addDocument("en", "how to use this app", "help.general");
manager.addDocument("en", "i have an error", "help.error");

// 3. Train and Save the model
(async () => {
  await manager.train();
  manager.save();
  console.log("✅ Local AI (NLP.js) trained and ready.");
})();

// POST /api/gpt/query
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    let result = "";
    let navigatePath = null;
    let options = [];
    const thoughtProcess = [];

    const sessionUser = req.session.user || {};
    const isLoggedIn = !!sessionUser.empid;

    if (!isLoggedIn) {
      return res.json({
        result: "🔒 You need to be logged in to use the HR Assistant. Please log in and try again.",
        options: []
      });
    }

    if (!req.session.aiContext) {
      req.session.aiContext = { mode: "idle", step: 0, data: { rows: [] } };
    }
    const aiContext = req.session.aiContext;

    // --- CASE A: CONTINUING AN EXISTING WIZARD ---
    if (aiContext.mode === "applying_leave") {
      thoughtProcess.push(`Wizard Mode: applying_leave | Step: ${aiContext.step}`);

      // --- RESET LOGIC ---
      const isResetIntent = query.toLowerCase().includes("apply") && query.toLowerCase().includes("leave");
      const isReportIntent = query.toLowerCase().includes("report");

      if (isReportIntent) {
        req.session.aiContext = { mode: "idle", step: 0, data: {} };
        return res.json({ result: "Opening Leave Report...", options: [], navigate: `/leave?action=report&t=${Date.now()}` });
      }

      // --- NEW: Handle Cancel Request (Prioritized) ---
      if (query.toLowerCase().includes("cancel app #")) {
        const cancelLno = query.match(/\d+/g)?.[0];
        if (cancelLno) {
          await LeaveApplication.update({ status: 'Cancelled', remarks: 'Cancelled via AI to replace with new request' }, { where: { lno: cancelLno } });
          await LeaveDetails.update({ c_hr_app_status: 'Rejected' }, { where: { lno: cancelLno } });
          aiContext.step = 1;
          aiContext.data = { rows: [] };
          return res.json({ result: `✅ Application **#${cancelLno}** has been cancelled. You can now provide your **new dates**.`, options: [] });
        }
      }

      if (isResetIntent) {
        aiContext.step = 1;
        aiContext.data = { rows: [] };
        return res.json({ result: "Starting over. Which date(s) are you planning to take off?", options: ["19th", "19 to 20"] });
      }

      if (!aiContext.data.rows) aiContext.data.rows = [];

      if (aiContext.step === 1) { // Waiting for Dates
        // If they just started or reset, don't show an error, just prompt
        if (query.toLowerCase().includes("apply") && query.toLowerCase().includes("leave")) {
          return res.json({ result: "Which date(s) are you planning to take off? (e.g. '19th', '19 to 20')", options: [] });
        }

        const dateMatch = query.match(/\d+/g);
        if (!dateMatch || dateMatch.length < 1) {
          result = "Could you please specify which **date(s)** you want to apply for? (e.g. '19th', '19 to 20')";
          return res.json({ result, options: [] });
        }

        // --- NEW: Overlap Validation ---
        try {
          const startDay = parseInt(dateMatch[0]);
          const endDay = dateMatch[1] ? parseInt(dateMatch[1]) : startDay;

          // Use current month/year but set clear start/end of day
          const now = new Date();
          const fromDate = new Date(now.getFullYear(), now.getMonth(), startDay, 0, 0, 0);
          const toDate = new Date(now.getFullYear(), now.getMonth(), endDay, 23, 59, 59);

          // Check for overlaps in existing applications (Pending=0 or Approved=1)
          const overlap = await LeaveDetails.findOne({
            where: {
              empno: sessionUser.empid,
              [Sequelize.Op.and]: [
                { frmdt: { [Sequelize.Op.lte]: toDate } },
                { todate: { [Sequelize.Op.gte]: fromDate } }
              ]
            },
            include: [{
              model: LeaveApplication,
              as: 'application',
              where: { status: { [Sequelize.Op.in]: ["0", "1"] } }
            }]
          });

          if (overlap) {
            const overlapDate = new Date(overlap.frmdt).toLocaleDateString('en-GB').replace(/\//g, '-');
            const overlapLno = overlap.lno;
            result = `⚠️ **Conflict Detected!** You already have Application **#${overlapLno}** for **${overlapDate}**. \n\nYou cannot apply for the same dates twice. Would you like to cancel the old one and start fresh?`;
            return res.json({ result, options: [`Cancel App #${overlapLno}`, "Apply for Leave", "View Report"], isError: true });
          }

          // Check for internal overlaps within the current multi-row application
          const internalOverlap = aiContext.data.rows.find(r => {
            const m = r.dates.match(/\d+/g);
            if (!m) return false;
            const s = parseInt(m[0]);
            const e = m[1] ? parseInt(m[1]) : s;
            return (startDay <= e && endDay >= s);
          });

          if (internalOverlap) {
            result = `⚠️ **Duplicate!** You've already added **${internalOverlap.dates}** to this request. \n\nPlease provide different dates or proceed to the next step.`;
            return res.json({ result, options: ["No, proceed to Reason", "Apply for Leave"] });
          }

          // If no overlap, proceed
          aiContext.data.rows.push({ dates: query, type: "" });
          aiContext.step = 2;
          result = `Got it: **${query}**. Is this for a **Full Day**, or **Half Day**?`;
          options = ["FULL DAY", "HALF DAY"];
        } catch (err) {
          result = "❌ Validation error: " + err.message;
        }
      }
      else if (aiContext.step === 2) { // Waiting for Day Type
        let type = query.toLowerCase().includes("half") ? "HALF DAY" : "FULL DAY";
        if (aiContext.data.rows.length > 0) {
          aiContext.data.rows[aiContext.data.rows.length - 1].type = type;
        }

        aiContext.step = 3;
        result = "Would you like to **add another row** to this application (e.g. for different dates or a half-day)?";
        options = ["Add Another Row", "No, proceed to Reason"];
      }
      else if (aiContext.step === 3) { // Add another row?
        if (query.toLowerCase().includes("another") || query.toLowerCase().includes("add")) {
          aiContext.step = 1;
          result = "Sure! What are the **next date(s)**?";
        } else {
          aiContext.step = 4;
          result = "Got it. What is the **Reason** for your leave?";
          options = ["PERSONAL", "SICK", "EMERGENCY"];
        }
      }
      else if (aiContext.step === 4) { // Waiting for Reason
        aiContext.data.reason = query.toUpperCase();
        aiContext.step = 5;
        result = "Please provide your contact **Address** (or type 'skip').";
        options = ["skip"];
      }
      else if (aiContext.step === 5) { // Waiting for Address
        aiContext.data.address = query.toLowerCase() === 'skip' ? "" : query;
        aiContext.step = 6;
        result = "And your contact **Phone Number**? (or type 'skip').";
        options = ["skip"];
      }
      else if (aiContext.step === 6) { // Waiting for Phone
        try {
          aiContext.data.phone = query.toLowerCase() === 'skip' ? "" : query;
          aiContext.step = 7;

          const sessionUser = req.session.user || {};
          const emp = await EmployeeMaster.findOne({
            where: { empid: sessionUser.empid },
            include: [{ model: EmpOfficial, as: 'official' }]
          });

          let empName = emp?.ename || "Employee";
          let empId = sessionUser?.empid || "Unknown";
          let empDesig = emp?.official?.designation || "";
          let desigLine = empDesig ? `🏷️ Designation: ${empDesig}\n` : "";

          let rowSummary = aiContext.data.rows.map((r, i) => `   Row ${i + 1}: ${r.dates} (${r.type})`).join("\n");

          result = `Perfect. Here is your Multi-Row Leave Summary:\n\n` +
            `👤 Employee: ${empName} (${empId})\n` +
            desigLine +
            `📅 Dates:\n${rowSummary}\n` +
            `📝 Reason: ${aiContext.data.reason}\n` +
            `🏠 Address: ${aiContext.data.address || emp?.p_address || 'As per Master'}\n` +
            `📞 Phone: ${aiContext.data.phone || emp?.cadd_mobile || 'As per Master'}\n\n` +
            `Does this look correct?`;
          options = ["Yes", "Cancel"];
        } catch (sumErr) {
          result = "❌ Error preparing summary: " + sumErr.message;
          req.session.aiContext = { mode: "idle", step: 0, data: {} };
        }
      }
      else if (aiContext.step === 7) { // Confirmation
        if (query.toLowerCase().includes("yes") || query.toLowerCase().includes("confirm")) {
          const t = await EmployeeMaster.sequelize.transaction();
          try {
            const emp = await EmployeeMaster.findOne({
              where: { empid: sessionUser.empid },
              include: [{ model: EmpOfficial, as: 'official' }],
              transaction: t
            });
            const maxLnoResult = await LeaveApplication.findOne({
              attributes: [[EmployeeMaster.sequelize.fn('COALESCE', EmployeeMaster.sequelize.fn('MAX', EmployeeMaster.sequelize.col('lno')), 0), 'maxLno']],
              raw: true, transaction: t
            });
            const nextLno = Number(maxLnoResult.maxLno) + 1;

            let totalNod = 0;
            // Create Application Header
            await LeaveApplication.create({
              lno: nextLno, ldate: new Date(), empid: emp.empid, ename: emp.ename,
              designation: emp.official?.designation || "",
              department: emp.deptname || emp.dept || "",
              pofl: aiContext.data.reason || "Personal",
              address: aiContext.data.address || emp.p_address || "As per Master Records",
              phno: aiContext.data.phone || emp.cadd_mobile || 0,
              c_unit: emp.unit_id || "1",
              c_gempid: "AI_BOT", status: "0"
            }, { transaction: t });

            // Create Multiple Details Rows
            for (const row of aiContext.data.rows) {
              const dateMatch = row.dates.match(/\d+/g);
              let fromDate = new Date(), toDate = new Date();
              if (dateMatch && dateMatch.length >= 1) {
                const startDay = parseInt(dateMatch[0]);
                const endDay = dateMatch[1] ? parseInt(dateMatch[1]) : startDay;
                fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), startDay);
                toDate = new Date(new Date().getFullYear(), new Date().getMonth(), endDay);
              }

              let rowNod = row.type === "FULL DAY" ? (Math.ceil(Math.abs(toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1) : 0.5;
              totalNod += rowNod;

              await LeaveDetails.create({
                lno: nextLno, empno: emp.empid, frmdt: fromDate, todate: toDate,
                nod: rowNod, daydt: row.type, c_hr_app_status: "0",
                c_unit: emp.unit_id || "1", c_gempid: "AI_BOT"
              }, { transaction: t });
            }

            // Create Position Entry
            await LeavePosition.create({
              lno: nextLno, ldate: new Date(), empid: emp.empid, leaves_applied: totalNod,
              unit: emp.unit_id || "1", gempid: "AI_BOT"
            }, { transaction: t });

            await t.commit();
            result = `✅ Success! Leave Application **#${nextLno}** with ${aiContext.data.rows.length} rows created.`;
            navigatePath = "/leave";
          } catch (dbErr) {
            await t.rollback();
            result = "❌ Error saving leave: " + dbErr.message;
          }
          req.session.aiContext = { mode: "idle", step: 0, data: {} };
        } else {
          result = "Application cancelled.";
          req.session.aiContext = { mode: "idle", step: 0, data: {} };
        }
      }
      return res.json({ result, options, navigate: navigatePath });
    } else if (aiContext.mode === "applying_onduty") {
      thoughtProcess.push(`Wizard Mode: applying_onduty | Step: ${aiContext.step}`);

      if (aiContext.step === 1) { // Waiting for Date
        let selectedDate = new Date();
        const dateMatch = query.match(/\d+/g);
        if (query.toLowerCase() === "today") {
          selectedDate = new Date();
        } else if (query.toLowerCase() === "tomorrow") {
          selectedDate = new Date();
          selectedDate.setDate(selectedDate.getDate() + 1);
        } else if (dateMatch && dateMatch.length >= 1) {
          const day = parseInt(dateMatch[0]);
          selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        } else {
          return res.json({ result: "Please specify a valid date (e.g., '19th', 'today', 'tomorrow').", options: ["Today", "Tomorrow"] });
        }

        // Format as YYYY-MM-DD
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        aiContext.data.act_date = `${y}-${m}-${d}`;

        aiContext.step = 2;
        return res.json({
          result: `Date recorded: **${aiContext.data.act_date}**. Which shift is this for?`,
          options: ["GEN", "A", "B", "C"]
        });
      }

      if (aiContext.step === 2) { // Waiting for Shift
        aiContext.data.shift = query.toUpperCase();
        aiContext.step = 3;
        return res.json({
          result: `Shift set to **${aiContext.data.shift}**. Please enter the **From Time** (e.g. '09:00', '14:30'):`,
          options: ["09:00", "13:00"]
        });
      }

      if (aiContext.step === 3) { // Waiting for From Time
        aiContext.data.perm_ftime = query;
        aiContext.step = 4;
        return res.json({
          result: `From Time: **${query}**. Please enter the **To Time** (e.g. '12:00', '18:00'):`,
          options: ["12:00", "17:30"]
        });
      }

      if (aiContext.step === 4) { // Waiting for To Time
        aiContext.data.perm_ttime = query;
        aiContext.step = 5;
        return res.json({
          result: `To Time: **${query}**. What is the **Reason** for On Duty?`,
          options: ["Client Meeting", "Site Visit", "Official Training"]
        });
      }

      if (aiContext.step === 5) { // Waiting for Reason
        try {
          aiContext.data.reason_perm = query;
          aiContext.step = 6;

          // Calculate hours roughly
          const fTime = aiContext.data.perm_ftime.split(':').map(Number);
          const tTime = aiContext.data.perm_ttime.split(':').map(Number);
          let diffHrs = 0;
          if (fTime.length >= 2 && tTime.length >= 2) {
            const fMins = fTime[0] * 60 + fTime[1];
            const tMins = tTime[0] * 60 + tTime[1];
            diffHrs = Math.max(0, (tMins - fMins) / 60);
          }
          aiContext.data.no_of_hrs = diffHrs.toFixed(2);

          const emp = await EmployeeMaster.findOne({
            where: { empid: sessionUser.empid },
            include: [{ model: EmpOfficial, as: 'official' }]
          });

          aiContext.data.ename = emp?.ename || "Employee";
          aiContext.data.unit = emp?.uname || "";
          aiContext.data.division = emp?.divname || "";
          aiContext.data.designation = emp?.official?.designation || "";

          result = `Here is your On Duty Application Summary:\n\n` +
            `👤 Employee: ${aiContext.data.ename} (${sessionUser.empid})\n` +
            `📅 Date: ${aiContext.data.act_date}\n` +
            `⏰ Shift: ${aiContext.data.shift}\n` +
            `🕒 Duration: ${aiContext.data.perm_ftime} to ${aiContext.data.perm_ttime} (${aiContext.data.no_of_hrs} Hours)\n` +
            `📝 Reason: ${aiContext.data.reason_perm}\n\n` +
            `Does this look correct?`;
          options = ["Yes", "Cancel"];
        } catch (sumErr) {
          result = "❌ Error preparing summary: " + sumErr.message;
          req.session.aiContext = { mode: "idle", step: 0, data: {} };
        }
        return res.json({ result, options });
      }

      if (aiContext.step === 6) { // Confirmation
        if (query.toLowerCase().includes("yes") || query.toLowerCase().includes("confirm")) {
          const t = await OnDutyApplication.sequelize.transaction();
          try {
            const maxIdResult = await OnDutyApplication.findOne({
              attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('movement_id')), 0), 'maxId']],
              raw: true, transaction: t
            });
            const nextMovementId = Number(maxIdResult.maxId) + 1;

            await OnDutyApplication.create({
              movement_id: nextMovementId,
              movement_date: new Date(),
              empid: sessionUser.empid,
              ename: aiContext.data.ename,
              unit: aiContext.data.unit,
              division: aiContext.data.division,
              designation: aiContext.data.designation,
              act_date: aiContext.data.act_date,
              shift: aiContext.data.shift,
              perm_ftime: aiContext.data.perm_ftime,
              perm_ttime: aiContext.data.perm_ttime,
              no_of_hrs: aiContext.data.no_of_hrs,
              reason_perm: aiContext.data.reason_perm,
              created_by: aiContext.data.ename,
              status: 'Pending'
            }, { transaction: t });

            await t.commit();
            result = `✅ Success! On Duty Application **#${nextMovementId}** created successfully.`;
            navigatePath = "/onduty";
          } catch (dbErr) {
            await t.rollback();
            result = "❌ Error saving On Duty permission: " + dbErr.message;
          }
        } else {
          result = "Application cancelled.";
        }
        req.session.aiContext = { mode: "idle", step: 0, data: {} };
        return res.json({ result, options: ["Apply for Leave", "On Duty Application"], navigate: navigatePath });
      }
    } else if (aiContext.mode === "applying_tour") {
      thoughtProcess.push(`Wizard Mode: applying_tour | Step: ${aiContext.step}`);

      if (aiContext.step === 1) { // Destination
        aiContext.data.destination = query;
        aiContext.step = 2;
        return res.json({
          result: `Destination set to: **${query}**. What is the **From Date** of the Tour? (e.g. '20th', 'today')`,
          options: ["Today", "Tomorrow"]
        });
      }

      if (aiContext.step === 2) { // From Date
        let selectedDate = new Date();
        const dateMatch = query.match(/\d+/g);
        if (query.toLowerCase() === "today") {
          selectedDate = new Date();
        } else if (query.toLowerCase() === "tomorrow") {
          selectedDate = new Date();
          selectedDate.setDate(selectedDate.getDate() + 1);
        } else if (dateMatch && dateMatch.length >= 1) {
          const day = parseInt(dateMatch[0]);
          selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        } else {
          return res.json({ result: "Please specify a valid start date (e.g., '20th', 'today', 'tomorrow').", options: ["Today", "Tomorrow"] });
        }

        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        aiContext.data.tour_from_date = `${y}-${m}-${d}`;

        aiContext.step = 3;
        return res.json({
          result: `From Date: **${aiContext.data.tour_from_date}**. What is the **To Date**? (e.g. '22nd', 'tomorrow')`,
          options: ["Tomorrow"]
        });
      }

      if (aiContext.step === 3) { // To Date
        let selectedDate = new Date();
        const dateMatch = query.match(/\d+/g);
        if (query.toLowerCase() === "today") {
          selectedDate = new Date();
        } else if (query.toLowerCase() === "tomorrow") {
          selectedDate = new Date();
          selectedDate.setDate(selectedDate.getDate() + 1);
        } else if (dateMatch && dateMatch.length >= 1) {
          const day = parseInt(dateMatch[0]);
          selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        } else {
          return res.json({ result: "Please specify a valid end date (e.g., '22nd', 'tomorrow').", options: ["Tomorrow"] });
        }

        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        aiContext.data.tour_to_date = `${y}-${m}-${d}`;

        aiContext.step = 4;
        return res.json({
          result: `To Date: **${aiContext.data.tour_to_date}**. What is the **Purpose** of this Tour?`,
          options: ["Client Meeting", "Conference", "Project Implementation"]
        });
      }

      if (aiContext.step === 4) { // Purpose
        aiContext.data.purpose = query;
        aiContext.step = 5;
        return res.json({
          result: `Purpose: **${query}**. What is the **Estimated Amount** in ₹? (Or type 'skip')`,
          options: ["skip", "5000", "10000"]
        });
      }

      if (aiContext.step === 5) { // Estimated Amount
        aiContext.data.estimated_amount = query.toLowerCase() === "skip" ? null : Number(query) || null;
        try {
          aiContext.step = 6;
          const emp = await EmployeeMaster.findOne({
            where: { empid: sessionUser.empid },
            include: [{ model: EmpOfficial, as: 'official' }]
          });

          aiContext.data.ename = emp?.ename || "Employee";
          aiContext.data.unit = emp?.uname || "";
          aiContext.data.division = emp?.divname || "";
          aiContext.data.designation = emp?.official?.designation || "";

          result = `Here is your Tour Application Summary:\n\n` +
            `👤 Employee: ${aiContext.data.ename} (${sessionUser.empid})\n` +
            `📍 Destination: ${aiContext.data.destination}\n` +
            `📅 Duration: ${aiContext.data.tour_from_date} to ${aiContext.data.tour_to_date}\n` +
            `💼 Purpose: ${aiContext.data.purpose}\n` +
            `💰 Est. Amount: ₹${aiContext.data.estimated_amount || "N/A"}\n\n` +
            `Does this look correct?`;
          options = ["Yes", "Cancel"];
        } catch (sumErr) {
          result = "❌ Error preparing summary: " + sumErr.message;
          req.session.aiContext = { mode: "idle", step: 0, data: {} };
        }
        return res.json({ result, options });
      }

      if (aiContext.step === 6) { // Confirmation
        if (query.toLowerCase().includes("yes") || query.toLowerCase().includes("confirm")) {
          const t = await TourApplication.sequelize.transaction();
          try {
            const maxId = await TourApplication.max('tour_id', { transaction: t }) || 0;
            const nextTourId = maxId + 1;

            await TourApplication.create({
              tour_id: nextTourId,
              tour_date: new Date(),
              empid: sessionUser.empid,
              ename: aiContext.data.ename,
              unit: aiContext.data.unit,
              division: aiContext.data.division,
              designation: aiContext.data.designation,
              tour_from_date: aiContext.data.tour_from_date,
              tour_to_date: aiContext.data.tour_to_date,
              purpose: aiContext.data.purpose,
              destination: aiContext.data.destination,
              estimated_amount: aiContext.data.estimated_amount,
              created_by: aiContext.data.ename,
              status: 'Pending'
            }, { transaction: t });

            await t.commit();
            result = `✅ Success! Tour Application **#${nextTourId}** created successfully.`;
            navigatePath = "/tour";
          } catch (dbErr) {
            await t.rollback();
            result = "❌ Error saving Tour application: " + dbErr.message;
          }
        } else {
          result = "Application cancelled.";
        }
        req.session.aiContext = { mode: "idle", step: 0, data: {} };
        return res.json({ result, options: ["Apply for Leave", "Tour Application"], navigate: navigatePath });
      }
    }

    // --- CASE B: STARTING A NEW CONVERSATION (NLP) ---
    const response = await manager.process("en", query);
    const intent = response.intent;
    const score = response.score;
    console.log(`[NLP Debug] Query: "${query}" | Intent: ${intent} | Score: ${(score * 100).toFixed(2)}%`);
    thoughtProcess.push(`Intent: ${intent} (${(score * 100).toFixed(2)}%)`);

    // --- NEW: SCORE THRESHOLD ---
    let finalIntent = intent;
    if (score < 0.85) { // Increased threshold to 85% to favor Python fallback
      console.log(`[NLP Debug] Score below 85% -> Falling back to Python Agent`);
      thoughtProcess.push("Confidence low -> Falling back to Python");
      finalIntent = "None";
    }

    switch (finalIntent) {
      case "greeting.hello":
        result = "Hello! I am your HR Assistant. How can I help you today?";
        break;

      case "leave.apply":
        aiContext.mode = "applying_leave";
        aiContext.step = 1;
        aiContext.data = {};
        result = "I'd be happy to help you apply for leave! First, which date(s) are you planning to take off?";
        break;

      case "onduty.apply":
        aiContext.mode = "applying_onduty";
        aiContext.step = 1;
        aiContext.data = {};
        result = "I can help you apply for On Duty! First, what date is this for? (e.g. '20th', 'today')";
        options = ["Today", "Tomorrow"];
        break;

      case "tour.apply":
        aiContext.mode = "applying_tour";
        aiContext.step = 1;
        aiContext.data = {};
        result = "I'd be glad to help you register a new Tour application. First, what is your destination place?";
        options = ["Delhi", "Mumbai", "Bangalore"];
        break;

      case "navigation.goto":
        const lower = query.toLowerCase();
        if (lower.includes("leave")) navigatePath = "/leave";
        else if (lower.includes("tour")) navigatePath = "/tour";
        else if (lower.includes("onduty") || lower.includes("on duty")) navigatePath = "/onduty";
        else if (lower.includes("shift")) navigatePath = "/shiftchange";
        else if (lower.includes("payroll")) navigatePath = "/payroll";
        else if (lower.includes("employee")) navigatePath = "/employees";

        result = navigatePath ? `Sure! Taking you there now.` : "I'm not sure which module you mean.";
        break;

      case "holiday.next":
        const todayStr = new Date().toISOString().split('T')[0];
        const nextHoliday = await Holiday.findOne({
          where: { hdate: { [Op.gte]: todayStr } },
          order: [['hdate', 'ASC']]
        });
        result = nextHoliday
          ? `The next holiday is "${nextHoliday.hdesc}" on ${nextHoliday.hdate}.`
          : "No upcoming holidays found.";
        break;

      case "attendance.late":
        const today = new Date().toISOString().split('T')[0];
        const lateComers = await Attendance.findAll({
          where: { att_date: today, late_mins: { [Op.gt]: 0 } },
          include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename'] }]
        });
        result = lateComers.length > 0
          ? `Found ${lateComers.length} late comers: ` + lateComers.map(a => a.employee?.ename).join(", ")
          : "No late comers today!";
        break;

      case "salary.personal":
        if (isLoggedIn) {
          const salary = await EmpSalary.findOne({ where: { empid: sessionUser.empid } });
          result = salary ? `Your basic is ₹${salary.basic}.` : "Salary record not found.";
        } else {
          result = "Please log in first.";
        }
        break;

      default:
        // --- NEW: FALLBACK TO PYTHON AGENT ---
        try {
          const axios = require('axios');
          // Use host.docker.internal for Docker containers on Windows
          const pythonUrl = process.env.PYTHON_AGENT_URL || 'http://agent_python:8001/process';

          const response = await axios.post(pythonUrl, {
            query: query,
            user_context: {
              empid: sessionUser.empid,
              ename: sessionUser.ename
            }
          }, { timeout: 4000 });

          if (response.data && response.data.result) {
            result = response.data.result;
            if (response.data.options) options = response.data.options;
          } else {
            result = "Python agent replied, but no result found.";
          }
        } catch (err) {
          console.error("Python Agent Error:", err.message);
          result = `⚠️ **Python Connection Error**: ${err.message}. \n\nCheck if your Python agent is running on port 8001.`;
        }
        break;
    }

    const homeOptions = ["Apply for Leave", "Check Attendance", "Leave Report", "On Duty Application"];
    const finalOptions = options.length > 0 ? options : homeOptions;

    console.log(`[Local AI] Query: "${query}" | ${thoughtProcess.join(" | ")}`);
    return res.json({ result, options: finalOptions, navigate: navigatePath });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
