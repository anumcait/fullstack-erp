# Target Schema (Postgres models)

## HR.AdvanceApplication  (table: advance_permission)
| Column | Type | PK | Null |
|---|---|---|---|
| advance_id | BIGINT | PK | nullable |
| advance_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| ename | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| designation | STRING |  | nullable |
| advance_type | STRING |  | nullable |
| advance_amount | DECIMAL |  | nullable |
| gross_salary | DECIMAL |  | nullable |
| reason | TEXT |  | nullable |
| no_of_installments | INTEGER |  | nullable |
| monthly_installment | DECIMAL |  | nullable |
| deduct_from_month | INTEGER |  | nullable |
| deduct_from_year | INTEGER |  | nullable |
| deduction_schedule | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |

## HR.Attendance  (table: emp_attendance)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | nullable |
| att_date | DATEONLY |  | nullable |
| shift | STRING |  | nullable |
| shift_start | TIME |  | nullable |
| shift_end | TIME |  | nullable |
| in_time | TIME |  | nullable |
| out_time | TIME |  | nullable |
| lunch_out | TIME |  | nullable |
| lunch_in | TIME |  | nullable |
| late_hrs | DECIMAL |  | nullable |
| late_mins | DECIMAL |  | nullable |
| late_exempt | BOOLEAN |  | nullable |
| ot_hrs | DECIMAL |  | nullable |
| ot_mins | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| leave_type | STRING |  | nullable |
| lop_days | DECIMAL |  | nullable |
| woff_day | DECIMAL |  | nullable |
| holiday | BOOLEAN |  | nullable |
| tour_days | DECIMAL |  | nullable |
| remarks | STRING |  | nullable |
| out_status | STRING |  | nullable |
| att_flag | INTEGER |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| department | STRING |  | nullable |
| app_ot | STRING |  | nullable |
| app_status | STRING |  | nullable |
| app_remarks | STRING |  | nullable |
| hr_app_ot | STRING |  | nullable |
| hr_app_status | STRING |  | nullable |
| hr_remarks | STRING |  | nullable |
| final_status | STRING |  | nullable |
| last_upd_id | INTEGER |  | nullable |
| last_upd_dt | DATE |  | nullable |
| gempid | STRING |  | nullable |

## HR.RawPunch  (table: t_attendance_raw_punch)
| Column | Type | PK | Null |
|---|---|---|---|
| id | BIGINT | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| punch_time | DATE |  | NOT NULL |
| punch_date | DATEONLY |  | nullable |
| direction | STRING |  | nullable |
| device_id | STRING |  | nullable |
| device_name | STRING |  | nullable |
| mode | STRING |  | nullable |
| source | STRING |  | nullable |
| batch_id | STRING |  | nullable |
| processed | BOOLEAN |  | nullable |
| created_at | DATE |  | nullable |

## HR.PunchBatch  (table: t_punch_batch)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| batch_id | STRING |  | nullable |
| source | STRING |  | nullable |
| filename | STRING |  | nullable |
| total_records | INTEGER |  | nullable |
| processed_records | INTEGER |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |

## HR.CompanySettings  (table: m_company_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| company_name | STRING |  | NOT NULL |
| title | STRING |  | nullable |
| short_name | STRING |  | nullable |
| address | TEXT |  | nullable |
| phone | STRING |  | nullable |
| email | STRING |  | nullable |
| website | STRING |  | nullable |
| gstin | STRING |  | nullable |
| cin | STRING |  | nullable |
| pan | STRING |  | nullable |
| pf_number | STRING |  | nullable |
| esi_number | STRING |  | nullable |
| logo_url | TEXT |  | nullable |
| favicon_url | TEXT |  | nullable |
| payroll_pt_rate | DECIMAL |  | nullable |
| payroll_ot_multiplier | DECIMAL |  | nullable |
| c_last_update | DATE |  | nullable |

## HR.DisciplinaryCase  (table: t_disciplinary_case)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| case_no | STRING |  | nullable |
| empid | INTEGER |  | NOT NULL |
| incident_date | DATEONLY |  | nullable |
| reported_date | DATEONLY |  | nullable |
| nature | STRING |  | nullable |
| description | TEXT |  | nullable |
| severity | STRING |  | nullable |
| status | STRING |  | nullable |
| reported_by | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.ShowCause  (table: t_show_cause)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| case_id | INTEGER |  | NOT NULL |
| notice_no | STRING |  | nullable |
| issued_date | DATEONLY |  | nullable |
| response_deadline | DATEONLY |  | nullable |
| charges | TEXT |  | nullable |
| employee_response | TEXT |  | nullable |
| response_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.DisciplinaryAction  (table: t_disciplinary_action)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| case_id | INTEGER |  | NOT NULL |
| action_type | STRING |  | nullable |
| action_date | DATEONLY |  | nullable |
| description | TEXT |  | nullable |
| effective_from | DATEONLY |  | nullable |
| effective_to | DATEONLY |  | nullable |
| approved_by | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |

## HR.EmpExperience  (table: m_emp_experience)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| empid | INTEGER |  | NOT NULL |
| name | STRING |  | nullable |
| address | STRING |  | nullable |
| ffrom | DATE |  | nullable |
| tto | DATE |  | nullable |
| duration | STRING |  | nullable |
| onj | STRING |  | nullable |
| onl | STRING |  | nullable |
| salary | INTEGER |  | nullable |
| nod | STRING |  | nullable |
| c_last_update | DATE |  | nullable |
| c_upd_userid | INTEGER |  | nullable |
| c_sno | INTEGER |  | nullable |
| c_gempid | STRING |  | nullable |

## HR.ExtOt  (table: emp_ext_ot)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| ename | STRING |  | nullable |
| ot_date | DATEONLY |  | NOT NULL |
| in_time | TIME |  | nullable |
| out_time | TIME |  | nullable |
| ot_hrs | DECIMAL |  | nullable |
| ot_type | STRING |  | NOT NULL |
| app_status | STRING |  | nullable |
| emp_remarks | STRING |  | nullable |
| manager_remarks | STRING |  | nullable |
| hr_remarks | STRING |  | nullable |
| created_by | INTEGER |  | nullable |
| created_dt | DATE |  | nullable |
| manager_approved_by | INTEGER |  | nullable |
| manager_approved_dt | DATE |  | nullable |
| hr_approved_by | INTEGER |  | nullable |
| hr_approved_dt | DATE |  | nullable |

## HR.EmpFamily  (table: m_emp_family)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| empid | INTEGER |  | NOT NULL |
| fname | STRING |  | nullable |
| fage | STRING |  | nullable |
| frel | STRING |  | nullable |
| foccp | STRING |  | nullable |
| c_last_update | DATE |  | nullable |
| c_upd_userid | INTEGER |  | nullable |
| c_sno | INTEGER |  | nullable |
| c_gempid | STRING |  | nullable |

## HR.EmpOfficial  (table: m_emp_off_det)
| Column | Type | PK | Null |
|---|---|---|---|
| empid | INTEGER | PK | NOT NULL |
| doi | DATE |  | nullable |
| doj | DATE |  | nullable |
| jas | STRING |  | nullable |
| pp | STRING |  | nullable |
| tp | STRING |  | nullable |
| rto | STRING |  | nullable |
| rto_dept | STRING |  | nullable |
| designation | STRING |  | nullable |
| emp_status | CHAR |  | nullable |
| pfacno | STRING |  | nullable |
| esiacno | STRING |  | nullable |
| bankacno | STRING |  | nullable |
| passport_no | STRING |  | nullable |
| validity | INTEGER |  | nullable |
| panno | STRING |  | nullable |
| oc | CHAR |  | nullable |
| bond_exec | CHAR |  | nullable |
| bond_yrs | INTEGER |  | nullable |
| bond_frmdt | DATE |  | nullable |
| bond_todt | DATE |  | nullable |
| doinc | DATE |  | nullable |
| inc_note | STRING |  | nullable |
| special_note | STRING |  | nullable |
| c_weekly_off | STRING |  | nullable |
| c_high_qual | STRING |  | nullable |
| c_aadhar_no | BIGINT |  | nullable |
| c_last_update | DATE |  | nullable |
| c_upd_userid | INTEGER |  | nullable |
| c_default_shift | STRING |  | nullable |
| c_doj_inc_date | DATE |  | nullable |
| c_shift_disable | INTEGER |  | nullable |
| c_gempid | STRING |  | nullable |
| c_uan_no | BIGINT |  | nullable |
| bankname | STRING |  | nullable |
| branchname | STRING |  | nullable |
| ifsccode | STRING |  | nullable |

## HR.EmpQualification  (table: m_emp_qualification)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| empid | INTEGER |  | NOT NULL |
| course | STRING |  | nullable |
| noi | STRING |  | nullable |
| per | STRING |  | nullable |
| year | STRING |  | nullable |
| c_last_update | DATE |  | nullable |
| c_upd_userid | INTEGER |  | nullable |
| c_sno | INTEGER |  | nullable |
| c_gempid | STRING |  | nullable |

## HR.EmpSalary  (table: m_emp_salary)
| Column | Type | PK | Null |
|---|---|---|---|
| empid | INTEGER | PK | NOT NULL |
| basic | INTEGER |  | nullable |
| hra | INTEGER |  | nullable |
| conveyance | INTEGER |  | nullable |
| washing_allowance | INTEGER |  | nullable |
| others1 | INTEGER |  | nullable |
| others2 | INTEGER |  | nullable |
| others3 | INTEGER |  | nullable |
| others4 | INTEGER |  | nullable |
| others5 | INTEGER |  | nullable |
| others6 | INTEGER |  | nullable |
| others7 | INTEGER |  | nullable |
| others8 | INTEGER |  | nullable |
| others9 | INTEGER |  | nullable |
| deduct_others1 | INTEGER |  | nullable |
| deduct_others2 | INTEGER |  | nullable |
| deduct_others3 | INTEGER |  | nullable |
| deduct_others4 | INTEGER |  | nullable |
| IS_esi | CHAR |  | nullable |
| IS_pf | CHAR |  | nullable |
| IS_lic | CHAR |  | nullable |
| IS_ot | CHAR |  | nullable |
| tds_amount | INTEGER |  | nullable |
| lic_amount | INTEGER |  | nullable |
| pay_mode | STRING |  | nullable |
| c_last_update | DATE |  | nullable |
| c_upd_userid | INTEGER |  | nullable |

## HR.EmployeeMaster  (table: employee_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | UUID |  | nullable |
| empid | INTEGER | PK | NOT NULL |
| created | DATE |  | nullable |
| updated | DATE |  | nullable |
| unit_id | INTEGER |  | NOT NULL |
| div_id | INTEGER |  | nullable |
| dept_id | INTEGER |  | nullable |
| sec_id | INTEGER |  | nullable |
| designation_id | INTEGER |  | nullable |
| reporting_manager_id | INTEGER |  | nullable |
| uname | STRING |  | nullable |
| divname | STRING |  | nullable |
| deptname | STRING |  | nullable |
| secname | STRING |  | nullable |
| gender | STRING |  | nullable |
| marital_status | STRING |  | nullable |
| ename | STRING |  | nullable |
| fname | STRING |  | nullable |
| dob | DATE |  | nullable |
| pob | STRING |  | nullable |
| bgroup | STRING |  | nullable |
| mother_tongue | STRING |  | nullable |
| idfm1 | STRING |  | nullable |
| idfm2 | STRING |  | nullable |
| lang_known | STRING |  | nullable |
| cadd_sa | STRING |  | nullable |
| cadd_city | STRING |  | nullable |
| cadd_state | STRING |  | nullable |
| cadd_phone | STRING |  | nullable |
| cadd_mobile | STRING |  | nullable |
| cadd_pin | STRING |  | nullable |
| cadd_email | STRING |  | nullable |
| padd_sa | STRING |  | nullable |
| padd_city | STRING |  | nullable |
| padd_state | STRING |  | nullable |
| padd_phone | STRING |  | nullable |
| padd_mobile | STRING |  | nullable |
| padd_pin | STRING |  | nullable |
| padd_email | STRING |  | nullable |
| c_eff_date | DATEONLY |  | nullable |
| c_status | CHAR |  | nullable |
| c_gen_user | BIGINT |  | nullable |
| c_gen_date | DATE |  | nullable |
| employment_status | STRING |  | nullable |
| status | STRING |  | nullable |
| resignation_date | DATE |  | nullable |
| termination_date | DATE |  | nullable |
| left_date | DATE |  | nullable |
| left_reason | STRING |  | nullable |
| employee_profile | TEXT |  | nullable |
| applications | TEXT |  | nullable |
| summary | STRING |  | nullable |
| photo_blob | BLOB |  | nullable |
| img_name | STRING |  | nullable |
| img_mimetype | STRING |  | nullable |
| img_charset | STRING |  | nullable |
| img_lastupd | DATE |  | nullable |
| is_active | BOOLEAN |  | nullable |
| is_approved | BOOLEAN |  | nullable |
| created_by | STRING |  | nullable |
| updated_by | STRING |  | nullable |
| deletedAt | DATE |  | nullable |

## HR.TaxRegime  (table: t_emp_tax_regime)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| financial_year | STRING |  | NOT NULL |
| regime | STRING |  | NOT NULL |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.TaxInvestment  (table: t_emp_tax_investment)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| financial_year | STRING |  | NOT NULL |
| section | STRING |  | NOT NULL |
| description | STRING |  | nullable |
| amount | DECIMAL |  | nullable |
| proof_attached | BOOLEAN |  | nullable |
| declared_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.TaxComputation  (table: t_emp_tax_computation)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| financial_year | STRING |  | NOT NULL |
| gross_income | DECIMAL |  | nullable |
| standard_deduction | DECIMAL |  | nullable |
| total_deductions | DECIMAL |  | nullable |
| taxable_income | DECIMAL |  | nullable |
| tax_before_cess | DECIMAL |  | nullable |
| rebate_87a | DECIMAL |  | nullable |
| education_cess | DECIMAL |  | nullable |
| total_tax | DECIMAL |  | nullable |
| tds_deducted | DECIMAL |  | nullable |
| tax_due | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| computed_at | DATE |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.ESILeaveApplication  (table: esi_leave_permission)
| Column | Type | PK | Null |
|---|---|---|---|
| esi_leave_id | BIGINT | PK | nullable |
| esi_leave_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| ename | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| designation | STRING |  | nullable |
| esi_no | STRING |  | nullable |
| esi_dispencery | STRING |  | nullable |
| hospital_name | STRING |  | nullable |
| leave_from_date | DATE |  | nullable |
| leave_to_date | DATE |  | nullable |
| no_of_days | INTEGER |  | nullable |
| reason | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_at | DATE |  | nullable |
| status | STRING |  | nullable |

## HR.ExitApplication  (table: t_exit_application)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| empname | STRING |  | nullable |
| resignation_date | DATEONLY |  | nullable |
| last_working_day | DATEONLY |  | nullable |
| reason | TEXT |  | nullable |
| type | STRING |  | nullable |
| status | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.ExitClearance  (table: t_exit_clearance)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| exit_application_id | INTEGER |  | NOT NULL |
| department | STRING |  | NOT NULL |
| cleared_by | STRING |  | nullable |
| cleared_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.FinalSettlement  (table: t_final_settlement)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| exit_application_id | INTEGER |  | NOT NULL |
| empid | INTEGER |  | nullable |
| full_name | STRING |  | nullable |
| designation | STRING |  | nullable |
| department | STRING |  | nullable |
| date_of_joining | DATEONLY |  | nullable |
| last_working_day | DATEONLY |  | nullable |
| total_tenure_years | DECIMAL |  | nullable |
| notice_period_days | INTEGER |  | nullable |
| notice_period_amount | DECIMAL |  | nullable |
| notice_recovered | BOOLEAN |  | nullable |
| leave_balance_days | DECIMAL |  | nullable |
| leave_encashment_amount | DECIMAL |  | nullable |
| gratuity_eligible | BOOLEAN |  | nullable |
| gratuity_amount | DECIMAL |  | nullable |
| salary_due_days | INTEGER |  | nullable |
| salary_due_amount | DECIMAL |  | nullable |
| other_earnings | DECIMAL |  | nullable |
| other_deductions | DECIMAL |  | nullable |
| other_deductions_remarks | TEXT |  | nullable |
| gross_payable | DECIMAL |  | nullable |
| tds_deducted | DECIMAL |  | nullable |
| net_payable | DECIMAL |  | nullable |
| settlement_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.GAttendance  (table: EQ_EMP_GATT)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| C_EMPID | INTEGER |  | NOT NULL |
| C_DATE | DATEONLY |  | NOT NULL |
| C_SHIFT | STRING |  | nullable |
| C_SIN | TIME |  | nullable |
| C_SOUT | TIME |  | nullable |
| C_LIN | TIME |  | nullable |
| C_LOUT | TIME |  | nullable |
| C_LATE_HRS | DECIMAL |  | nullable |
| C_LATE_MINS | DECIMAL |  | nullable |
| C_OT_HRS | DECIMAL |  | nullable |
| C_OT_MINS | DECIMAL |  | nullable |
| C_STATUS | STRING |  | nullable |
| C_LEAVE_TYPE | STRING |  | nullable |
| C_LOP_DAYS | DECIMAL |  | nullable |
| C_WOFF_DAYS | DECIMAL |  | nullable |
| C_HOLIDAY | BOOLEAN |  | nullable |
| C_REMARKS | STRING |  | nullable |
| C_UNIT | STRING |  | nullable |
| C_DIVISION | STRING |  | nullable |
| C_FINAL_STATUS | STRING |  | nullable |
| C_GEMPID | STRING |  | nullable |
| created_at | DATE |  | nullable |

## HR.Holiday  (table: holidays)
| Column | Type | PK | Null |
|---|---|---|---|
| hno | BIGINT | PK | nullable |
| hdate | DATEONLY |  | NOT NULL |
| hdesc | STRING |  | nullable |
| hday | STRING |  | nullable |
| yr | INTEGER |  | NOT NULL |
| hremarks | STRING |  | nullable |
| c_gen_user | BIGINT |  | nullable |
| c_gen_date | DATE |  | nullable |

## HR.LeaveApplication  (table: leave_application)
| Column | Type | PK | Null |
|---|---|---|---|
| lno | BIGINT | PK | nullable |
| ldate | DATE |  | nullable |
| empid | BIGINT |  | NOT NULL |
| ename | STRING |  | nullable |
| designation | STRING |  | nullable |
| department | STRING |  | nullable |
| pofl | STRING |  | nullable |
| address | STRING |  | nullable |
| phno | BIGINT |  | nullable |
| c_unit | STRING |  | nullable |
| c_gempid | STRING |  | NOT NULL |
| status | STRING |  | nullable |
| remarks | STRING |  | nullable |

## HR.LeaveApproval  (table: leave_approval)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| lno | BIGINT |  | NOT NULL |
| empid | BIGINT |  | NOT NULL |
| frmdt | DATE |  | nullable |
| todate | DATE |  | nullable |
| nod | DECIMAL |  | nullable |
| daydt | STRING |  | nullable |
| leave_type | STRING |  | nullable |
| remarks | STRING |  | nullable |
| cl_sanction | DECIMAL |  | nullable |
| el_sanction | DECIMAL |  | nullable |
| app_status | STRING |  | nullable |
| app_remarks | STRING |  | nullable |
| cancel_status | STRING |  | nullable |
| unit | STRING |  | nullable |
| final_status | STRING |  | NOT NULL |
| gempid | STRING |  | nullable |
| app_userid | BIGINT |  | nullable |
| app_date | DATE |  | nullable |

## HR.LeaveDetails  (table: leave_details)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| lno | BIGINT |  | nullable |
| empno | BIGINT |  | nullable |
| frmdt | DATE |  | nullable |
| todate | DATE |  | nullable |
| nod | DECIMAL |  | nullable |
| remarks | STRING |  | nullable |
| daydt | STRING |  | NOT NULL |
| c_hr_app_status | STRING |  | nullable |
| c_hr_app_remarks | STRING |  | nullable |
| c_cl_sanction | DECIMAL |  | nullable |
| c_el_sanction | DECIMAL |  | nullable |
| c_unit | STRING |  | nullable |
| c_gempid | STRING |  | nullable |

## HR.LeaveMaster  (table: leave_master)
| Column | Type | PK | Null |
|---|---|---|---|
| empid | BIGINT | PK | NOT NULL |
| empname | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| department | STRING |  | nullable |
| section | STRING |  | nullable |
| cls_utilised | DECIMAL |  | nullable |
| cls_balance | DECIMAL |  | nullable |
| els_utilised | DECIMAL |  | nullable |
| els_balance | DECIMAL |  | nullable |
| remarks | STRING |  | nullable |
| yr | DATE |  | nullable |
| cls_jan_status | INTEGER |  | nullable |
| cls_feb_status | INTEGER |  | nullable |
| cls_mar_status | INTEGER |  | nullable |
| cls_apr_status | INTEGER |  | nullable |
| cls_may_status | INTEGER |  | nullable |
| cls_jun_status | INTEGER |  | nullable |
| cls_jul_status | INTEGER |  | nullable |
| cls_aug_status | INTEGER |  | nullable |
| cls_sep_status | INTEGER |  | nullable |
| cls_oct_status | INTEGER |  | nullable |
| cls_nov_status | INTEGER |  | nullable |
| cls_dec_status | INTEGER |  | nullable |
| cls_last_update | DATE |  | nullable |
| final_status | STRING |  | NOT NULL |
| gempid | STRING |  | nullable |

## HR.LeavePosition  (table: leave_position)
| Column | Type | PK | Null |
|---|---|---|---|
| lno | BIGINT | PK | NOT NULL |
| ldate | DATE |  | NOT NULL |
| empid | BIGINT |  | NOT NULL |
| leaves_applied | DECIMAL |  | NOT NULL |
| cls_eligible | DECIMAL |  | NOT NULL |
| cls_utilized | DECIMAL |  | NOT NULL |
| cls_balance | DECIMAL |  | NOT NULL |
| els_eligible | DECIMAL |  | NOT NULL |
| els_utilized | DECIMAL |  | NOT NULL |
| els_balance | DECIMAL |  | NOT NULL |
| previous_lop_days | DECIMAL |  | NOT NULL |
| present_lop_days | DECIMAL |  | NOT NULL |
| tot_lop_days | DECIMAL |  | NOT NULL |
| last_lno | BIGINT |  | nullable |
| last_ldate | DATE |  | nullable |
| unit | STRING |  | nullable |
| remarks | STRING |  | nullable |
| app_date | DATE |  | nullable |
| app_user | BIGINT |  | nullable |
| approved_cls | DECIMAL |  | nullable |
| approved_els | BIGINT |  | nullable |
| app_cls_utilised | DECIMAL |  | nullable |
| app_cls_balance | DECIMAL |  | nullable |
| app_els_utilised | BIGINT |  | nullable |
| app_els_balance | BIGINT |  | nullable |
| gempid | STRING |  | nullable |

## HR.MusterRollSummary  (table: muster_roll_summary)
| Column | Type | PK | Null |
|---|---|---|---|
| empid | INTEGER | PK | NOT NULL |
| year | INTEGER | PK | NOT NULL |
| month | INTEGER | PK | NOT NULL |
| present_days | DECIMAL |  | nullable |
| woff_days | DECIMAL |  | nullable |
| holiday_days | DECIMAL |  | nullable |
| cl_days | DECIMAL |  | nullable |
| el_days | DECIMAL |  | nullable |
| lop_days | DECIMAL |  | nullable |
| absent_days | DECIMAL |  | nullable |
| total_days | DECIMAL |  | nullable |
| ot_hours | DECIMAL |  | nullable |
| late_hours | DECIMAL |  | nullable |
| att_bonus | CHAR |  | nullable |
| updated_at | DATE |  | nullable |

## HR.Notification  (table: notifications)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| title | STRING |  | NOT NULL |
| message | TEXT |  | NOT NULL |
| type | STRING |  | NOT NULL |
| isRead | BOOLEAN |  | nullable |
| link | STRING |  | nullable |
| createdAt | DATE |  | NOT NULL |
| updatedAt | DATE |  | NOT NULL |

## HR.OnDutyApplication  (table: onduty_permission)
| Column | Type | PK | Null |
|---|---|---|---|
| movement_id | BIGINT | PK | nullable |
| movement_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| ename | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| designation | STRING |  | nullable |
| act_date | DATE |  | nullable |
| shift | STRING |  | nullable |
| perm_ftime | TIME |  | nullable |
| perm_ttime | TIME |  | nullable |
| no_of_hrs | DECIMAL |  | nullable |
| reason_perm | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |

## HR.Payslip  (table: emp_payslip)
| Column | Type | PK | Null |
|---|---|---|---|
| C_MONTH | STRING | PK | nullable |
| C_YEAR | INTEGER | PK | nullable |
| C_EMPID | INTEGER | PK | nullable |
| C_ENAME | STRING |  | nullable |
| C_DESIG | STRING |  | nullable |
| C_DEPT | STRING |  | nullable |
| C_TOT_DAYS | DECIMAL |  | nullable |
| C_DAYS_PRESENT | DECIMAL |  | nullable |
| C_LEAVES_ALLOWED | DECIMAL |  | nullable |
| C_WOFF_HOL | DECIMAL |  | nullable |
| C_ABSENT_DAYS | DECIMAL |  | nullable |
| C_LATE_COMING | DECIMAL |  | nullable |
| C_PF_NUM | STRING |  | nullable |
| C_ESI_NUM | STRING |  | nullable |
| C_BASIC | DECIMAL |  | nullable |
| C_HRA | DECIMAL |  | nullable |
| C_CONV | DECIMAL |  | nullable |
| C_OTHERS | DECIMAL |  | nullable |
| C_TOT_SAL | DECIMAL |  | nullable |
| C_EARNED_BASIC | DECIMAL |  | nullable |
| C_EARNED_HRA | DECIMAL |  | nullable |
| C_EARNED_CONV | DECIMAL |  | nullable |
| C_EARNED_OTHERS | DECIMAL |  | nullable |
| C_EARNED_AB | DECIMAL |  | nullable |
| C_LOP_AMT | DECIMAL |  | nullable |
| C_EARNED_OT | DECIMAL |  | nullable |
| C_OT_HRS | DECIMAL |  | nullable |
| C_EARNED_BONUS | DECIMAL |  | nullable |
| C_EARNED_LUNCH | DECIMAL |  | nullable |
| C_EARNED_GROSS | DECIMAL |  | nullable |
| C_DED_PF | DECIMAL |  | nullable |
| C_DED_ESI | DECIMAL |  | nullable |
| C_DED_PT | DECIMAL |  | nullable |
| C_DED_LIC | DECIMAL |  | nullable |
| C_DED_TAX | DECIMAL |  | nullable |
| C_DED_ADV | DECIMAL |  | nullable |
| C_DED_OTH | DECIMAL |  | nullable |
| C_TOT_DED | DECIMAL |  | nullable |
| C_NET_AMT | DECIMAL |  | nullable |
| C_PAY_TYPE | STRING |  | nullable |
| C_BANK_ACNO | STRING |  | nullable |
| C_DED_MEALS | INTEGER |  | nullable |
| C_FYEAR | INTEGER |  | nullable |
| C_UNIT | STRING |  | nullable |
| C_LATE_HOURS | INTEGER |  | nullable |
| C_FINAL_STATUS | INTEGER |  | nullable |
| C_DIVISION | STRING |  | nullable |
| C_SECTION | STRING |  | nullable |
| C_EMP_TYPE | STRING |  | nullable |
| C_EMP_STATUS | CHAR |  | nullable |
| C_PF_EXIST | CHAR |  | nullable |
| C_ESI_EXIST | CHAR |  | nullable |
| C_OT_EXIST | CHAR |  | nullable |
| C_LIC_EXIST | CHAR |  | nullable |
| C_GEMPID | STRING |  | nullable |
| BANKNAME | STRING |  | nullable |
| BRANCHNAME | STRING |  | nullable |
| IFSCCODE | STRING |  | nullable |
| C_LATE_TIMES | INTEGER |  | nullable |
| C_LATE_HALF_DAYS | INTEGER |  | nullable |
| C_LATE_HALF_HOURS | INTEGER |  | nullable |
| C_LATE_DED_AMT | DECIMAL |  | nullable |

## HR.PfLedger  (table: t_pf_ledger)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| financial_year | STRING |  | nullable |
| month | INTEGER |  | nullable |
| pf_wages | DECIMAL |  | nullable |
| employee_share | DECIMAL |  | nullable |
| employer_share | DECIMAL |  | nullable |
| eps_share | DECIMAL |  | nullable |
| epf_share | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.PfChallan  (table: t_pf_challan)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| challan_no | STRING |  | nullable |
| financial_year | STRING |  | nullable |
| month | INTEGER |  | nullable |
| total_employees | INTEGER |  | nullable |
| total_wages | DECIMAL |  | nullable |
| total_employee_share | DECIMAL |  | nullable |
| total_employer_share | DECIMAL |  | nullable |
| total_eps | DECIMAL |  | nullable |
| total_epf | DECIMAL |  | nullable |
| grand_total | DECIMAL |  | nullable |
| remitted_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.KraTemplate  (table: t_kra_template)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| template_name | STRING |  | NOT NULL |
| department | STRING |  | nullable |
| designation | STRING |  | nullable |
| financial_year | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.KraTemplateItem  (table: t_kra_template_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| template_id | INTEGER |  | NOT NULL |
| kpi_name | STRING |  | NOT NULL |
| weightage | DECIMAL |  | nullable |
| target | STRING |  | nullable |
| measurement_unit | STRING |  | nullable |
| description | TEXT |  | nullable |
| sort_order | INTEGER |  | nullable |
| created_at | DATE |  | nullable |

## HR.AppraisalCycle  (table: t_appraisal_cycle)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| cycle_name | STRING |  | NOT NULL |
| cycle_type | STRING |  | nullable |
| financial_year | STRING |  | nullable |
| start_date | DATEONLY |  | nullable |
| end_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.Appraisal  (table: t_appraisal)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| cycle_id | INTEGER |  | NOT NULL |
| empid | INTEGER |  | NOT NULL |
| template_id | INTEGER |  | nullable |
| self_final_score | DECIMAL |  | nullable |
| manager_final_score | DECIMAL |  | nullable |
| overall_rating | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| reviewer | STRING |  | nullable |
| review_date | DATEONLY |  | nullable |
| comments | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.AppraisalRating  (table: t_appraisal_rating)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| appraisal_id | INTEGER |  | NOT NULL |
| template_item_id | INTEGER |  | NOT NULL |
| self_score | DECIMAL |  | nullable |
| manager_score | DECIMAL |  | nullable |
| self_remarks | TEXT |  | nullable |
| manager_remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.ProfileUpdateRequest  (table: profile_update_requests)
| Column | Type | PK | Null |
|---|---|---|---|
| id | UUID | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| request_type | STRING |  | NOT NULL |
| old_comm_address | STRING |  | nullable |
| new_comm_address | STRING |  | nullable |
| old_comm_phone | STRING |  | nullable |
| new_comm_phone | STRING |  | nullable |
| old_comm_mobile | STRING |  | nullable |
| new_comm_mobile | STRING |  | nullable |
| old_perm_address | STRING |  | nullable |
| new_perm_address | STRING |  | nullable |
| old_perm_phone | STRING |  | nullable |
| new_perm_phone | STRING |  | nullable |
| old_perm_mobile | STRING |  | nullable |
| new_perm_mobile | STRING |  | nullable |
| status | STRING |  | nullable |
| hr_remarks | STRING |  | nullable |
| reviewed_by | INTEGER |  | nullable |
| reviewed_at | DATE |  | nullable |
| created | DATE |  | nullable |
| updated | DATE |  | nullable |

## HR.JobRequisition  (table: t_job_requisition)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| req_no | STRING |  | NOT NULL |
| position_title | STRING |  | NOT NULL |
| department | STRING |  | nullable |
| no_of_positions | INTEGER |  | nullable |
| qualification | TEXT |  | nullable |
| experience_years | INTEGER |  | nullable |
| location | STRING |  | nullable |
| salary_range | STRING |  | nullable |
| description | TEXT |  | nullable |
| status | STRING |  | nullable |
| requested_by | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATEONLY |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.Candidate  (table: t_candidate)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| requisition_id | INTEGER |  | nullable |
| name | STRING |  | NOT NULL |
| email | STRING |  | nullable |
| phone | STRING |  | nullable |
| resume_url | TEXT |  | nullable |
| current_company | STRING |  | nullable |
| experience_years | DECIMAL |  | nullable |
| qualification | STRING |  | nullable |
| source | STRING |  | nullable |
| status | STRING |  | nullable |
| applied_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.Interview  (table: t_interview)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| candidate_id | INTEGER |  | NOT NULL |
| requisition_id | INTEGER |  | nullable |
| round | INTEGER |  | nullable |
| interview_date | DATE |  | nullable |
| interviewer | STRING |  | nullable |
| mode | STRING |  | nullable |
| status | STRING |  | nullable |
| feedback | TEXT |  | nullable |
| rating | INTEGER |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.OfferLetter  (table: t_offer_letter)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| candidate_id | INTEGER |  | NOT NULL |
| offer_no | STRING |  | NOT NULL |
| position_title | STRING |  | nullable |
| department | STRING |  | nullable |
| ctc | DECIMAL |  | nullable |
| joining_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| issued_date | DATEONLY |  | nullable |
| accepted_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.SalaryRegister  (table: salary_register)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| year | INTEGER |  | NOT NULL |
| month | INTEGER |  | NOT NULL |
| working_days | INTEGER |  | nullable |
| present_days | INTEGER |  | nullable |
| absent_days | INTEGER |  | nullable |
| leave_days | INTEGER |  | nullable |
| od_days | INTEGER |  | nullable |
| basic | DECIMAL |  | nullable |
| hra | DECIMAL |  | nullable |
| conveyance | DECIMAL |  | nullable |
| others | DECIMAL |  | nullable |
| gross_salary | DECIMAL |  | nullable |
| pf | DECIMAL |  | nullable |
| esi | DECIMAL |  | nullable |
| tds | DECIMAL |  | nullable |
| lic | DECIMAL |  | nullable |
| other_deductions | DECIMAL |  | nullable |
| total_deductions | DECIMAL |  | nullable |
| net_salary | DECIMAL |  | nullable |
| overtime_hrs | DECIMAL |  | nullable |
| overtime_amount | DECIMAL |  | nullable |
| ot_rate | DECIMAL |  | nullable |
| created_at | DATE |  | nullable |
| status | STRING |  | nullable |

## HR.ShiftChange  (table: shift_change)
| Column | Type | PK | Null |
|---|---|---|---|
| schange_no | INTEGER | PK | nullable |
| schange_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| empname | STRING |  | nullable |
| designation | STRING |  | nullable |
| department | STRING |  | nullable |
| act_shift | STRING |  | nullable |
| act_sstart_time | STRING |  | nullable |
| act_send_time | STRING |  | nullable |
| change_shift | STRING |  | nullable |
| cha_sstart_time | STRING |  | nullable |
| cha_send_time | STRING |  | nullable |
| purpose | STRING |  | nullable |
| remarks | STRING |  | nullable |
| schange_from | DATE |  | nullable |
| schange_to | DATE |  | nullable |
| app_status | STRING |  | NOT NULL |
| cancel_status | STRING |  | nullable |
| cancel_empid | BIGINT |  | nullable |
| cancel_date | DATE |  | nullable |
| unit | STRING |  | nullable |
| final_status | STRING |  | NOT NULL |
| gempid | STRING |  | nullable |

## HR.ShiftMaster  (table: shift_master)
| Column | Type | PK | Null |
|---|---|---|---|
| shift_id | BIGINT | PK | NOT NULL |
| shift_cd | STRING |  | nullable |
| start_time | STRING |  | nullable |
| end_time | STRING |  | nullable |
| lunch_start_time | STRING |  | nullable |
| lunch_end_time | STRING |  | nullable |
| u1 | STRING |  | nullable |
| u2 | STRING |  | nullable |
| u3 | STRING |  | nullable |
| u4 | STRING |  | nullable |
| u5 | STRING |  | nullable |
| u6 | STRING |  | nullable |
| c_eff_date | DATEONLY |  | nullable |
| c_status | CHAR |  | nullable |
| c_shift_status | CHAR |  | nullable |
| c_gen_user | BIGINT |  | nullable |
| c_gen_date | DATE |  | nullable |

## HR.ShiftSchedule  (table: shift_schedule)
| Column | Type | PK | Null |
|---|---|---|---|
| id | BIGINT | PK | nullable |
| shift_date | DATE |  | nullable |
| gen_date | DATE |  | nullable |
| gen_user | BIGINT |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| empid | BIGINT |  | NOT NULL |
| shift_cd | STRING |  | NOT NULL |
| machine_cd | STRING |  | nullable |
| remarks | STRING |  | nullable |
| shift_start_time | DATE |  | nullable |
| shift_end_time | DATE |  | nullable |
| shift_status | STRING |  | nullable |
| final_status | INTEGER |  | NOT NULL |
| gempid | STRING |  | nullable |

## HR.TourApplication  (table: tour_application)
| Column | Type | PK | Null |
|---|---|---|---|
| tour_id | BIGINT | PK | nullable |
| tour_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| ename | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| designation | STRING |  | nullable |
| tour_from_date | DATE |  | nullable |
| tour_to_date | DATE |  | nullable |
| purpose | TEXT |  | nullable |
| destination | STRING |  | nullable |
| estimated_amount | DECIMAL |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| approval_remark | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |

## HR.TrainingCourse  (table: t_training_course)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| course_code | STRING |  | nullable |
| course_name | STRING |  | NOT NULL |
| category | STRING |  | nullable |
| duration_hours | INTEGER |  | nullable |
| vendor | STRING |  | nullable |
| description | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.TrainingSession  (table: t_training_session)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| course_id | INTEGER |  | NOT NULL |
| session_code | STRING |  | nullable |
| trainer | STRING |  | nullable |
| mode | STRING |  | nullable |
| location | STRING |  | nullable |
| start_date | DATEONLY |  | nullable |
| end_date | DATEONLY |  | nullable |
| start_time | TIME |  | nullable |
| end_time | TIME |  | nullable |
| status | STRING |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.TrainingParticipant  (table: t_training_participant)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| session_id | INTEGER |  | NOT NULL |
| empid | INTEGER |  | NOT NULL |
| attendance | STRING |  | nullable |
| score | INTEGER |  | nullable |
| feedback | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.Certification  (table: t_certification)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| certification_name | STRING |  | NOT NULL |
| issued_by | STRING |  | nullable |
| issued_date | DATEONLY |  | nullable |
| expiry_date | DATEONLY |  | nullable |
| credential_url | TEXT |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.SkillMatrix  (table: t_skill_matrix)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| empid | INTEGER |  | NOT NULL |
| skill_name | STRING |  | NOT NULL |
| category | STRING |  | nullable |
| proficiency | INTEGER |  | nullable |
| years_experience | DECIMAL |  | nullable |
| last_used | DATEONLY |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## HR.WoffApplication  (table: woff_application)
| Column | Type | PK | Null |
|---|---|---|---|
| woff_id | BIGINT | PK | nullable |
| woff_date | DATE |  | nullable |
| empid | BIGINT |  | nullable |
| ename | STRING |  | nullable |
| unit | STRING |  | nullable |
| division | STRING |  | nullable |
| designation | STRING |  | nullable |
| department | STRING |  | nullable |
| section | STRING |  | nullable |
| current_woff_day | STRING |  | nullable |
| requested_woff_day | STRING |  | nullable |
| woff_from_date | DATE |  | nullable |
| woff_to_date | DATE |  | nullable |
| shift_cd | STRING |  | nullable |
| reason | TEXT |  | nullable |
| remarks | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| status | STRING |  | nullable |
| approval_remark | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |

## HR.User  (table: Users)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | NOT NULL |
| username | STRING |  | nullable |
| password_hash | TEXT |  | nullable |
| empid | INTEGER |  | nullable |
| ename | STRING |  | nullable |
| role | STRING |  | nullable |
| permissions | JSONB |  | nullable |
| is_active | BOOLEAN |  | nullable |
| last_login | DATE |  | nullable |
| previous_login | DATE |  | nullable |
| login_count | INTEGER |  | nullable |
| failed_attempts | INTEGER |  | nullable |
| password_changed_at | DATE |  | nullable |
| created_by | INTEGER |  | nullable |
| created_at | DATE |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.BOM  (table: t_bom)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| bom_no | STRING |  | NOT NULL |
| bom_name | STRING |  | NOT NULL |
| product_item_id | INTEGER |  | NOT NULL |
| product_code | STRING |  | NOT NULL |
| product_name | STRING |  | NOT NULL |
| product_id | INTEGER |  | nullable |
| output_quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| status | STRING |  | nullable |
| version | STRING |  | nullable |
| labour_cost | DECIMAL |  | nullable |
| overhead_cost | DECIMAL |  | nullable |
| overhead_is_percent | BOOLEAN |  | nullable |
| margin_percent | DECIMAL |  | nullable |
| selling_price | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.BOMItem  (table: t_bom_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| bom_id | INTEGER |  | NOT NULL |
| parent_item_id | INTEGER |  | nullable |
| sub_bom_id | INTEGER |  | nullable |
| sort_order | INTEGER |  | nullable |
| section_name | STRING |  | nullable |
| is_phantom | BOOLEAN |  | nullable |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| lot_quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| unit_cost | DECIMAL |  | nullable |
| operation | STRING |  | nullable |
| wastage_percent | DECIMAL |  | nullable |
| color | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |

## ERP.Batch  (table: m_item_batch)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| item_id | INTEGER |  | NOT NULL |
| batch_no | STRING |  | NOT NULL |
| quantity | DECIMAL |  | nullable |
| mfg_date | DATEONLY |  | nullable |
| exp_date | DATEONLY |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |

## ERP.CostCenter  (table: m_cost_center)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| name | STRING |  | NOT NULL |
| code | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.CustomerMaster  (table: m_customer_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| customer_code | STRING |  | NOT NULL |
| customer_name | STRING |  | NOT NULL |
| contact_person | STRING |  | nullable |
| email | STRING |  | nullable |
| phone | STRING |  | nullable |
| mobile | STRING |  | nullable |
| gstin | STRING |  | nullable |
| pan | STRING |  | nullable |
| billing_address | TEXT |  | nullable |
| shipping_address | TEXT |  | nullable |
| city | STRING |  | nullable |
| state | STRING |  | nullable |
| pincode | STRING |  | nullable |
| credit_limit | DECIMAL |  | nullable |
| credit_days | INTEGER |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.DeliveryChallan  (table: t_delivery_challan)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| dc_no | STRING |  | nullable |
| draft_no | STRING |  | nullable |
| dc_date | DATE |  | NOT NULL |
| party_id | INTEGER |  | nullable |
| party_name | STRING |  | nullable |
| returnable | BOOLEAN |  | nullable |
| dc_type | STRING |  | nullable |
| non_returnable_type | STRING |  | nullable |
| expected_return_date | DATEONLY |  | nullable |
| reference_no | STRING |  | nullable |
| authorization_ref | STRING |  | nullable |
| transfer_location | STRING |  | nullable |
| maintenance_type | STRING |  | nullable |
| vehicle_no | STRING |  | nullable |
| driver_name | STRING |  | nullable |
| department | STRING |  | nullable |
| through | STRING |  | nullable |
| requested_by | STRING |  | nullable |
| prepared_by | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| cancel_remarks | TEXT |  | nullable |
| cancel_by | STRING |  | nullable |
| cancel_date | DATE |  | nullable |
| req_date | DATEONLY |  | nullable |
| bill_no | STRING |  | nullable |
| bill_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| status | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.DeliveryChallanItem  (table: t_delivery_challan_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| dc_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| item_grp | STRING |  | nullable |
| wo_no | STRING |  | nullable |
| hs_code | STRING |  | nullable |
| tag | STRING |  | nullable |
| opn1 | STRING |  | nullable |
| opn2 | STRING |  | nullable |
| opn3 | STRING |  | nullable |
| quantity | DECIMAL |  | NOT NULL |
| order_prod_qty | DECIMAL |  | nullable |
| rate | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| unit | STRING |  | nullable |
| req_date | DATEONLY |  | nullable |
| returned_qty | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.EngineeringSettings  (table: m_engineering_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| key | STRING |  | NOT NULL |
| value | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.GRN  (table: ir)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| ir_no | STRING |  | NOT NULL |
| ir_date | DATE |  | NOT NULL |
| po_id | INTEGER |  | nullable |
| pr_id | INTEGER |  | nullable |
| supplier_id | INTEGER |  | NOT NULL |
| invoice_no | STRING |  | nullable |
| invoice_date | DATEONLY |  | nullable |
| gate_entry_no | STRING |  | nullable |
| status | STRING |  | nullable |
| approval_status | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| approval_remarks | TEXT |  | nullable |
| cancel_remarks | TEXT |  | nullable |
| cancel_by | STRING |  | nullable |
| cancel_date | DATE |  | nullable |
| qa_status | STRING |  | nullable |
| qa_by | STRING |  | nullable |
| qa_date | DATEONLY |  | nullable |
| qa_remarks | TEXT |  | nullable |
| bill_no | STRING |  | nullable |
| bill_date | DATEONLY |  | nullable |
| ir_type | STRING |  | nullable |
| dc_type | STRING |  | nullable |
| dept_cd | STRING |  | nullable |
| year | STRING |  | nullable |
| inward_date | DATEONLY |  | nullable |
| received_by | STRING |  | nullable |
| cost_posted | BOOLEAN |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.GRNItem  (table: t_ir_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| grn_id | INTEGER |  | NOT NULL |
| sl_no | STRING |  | nullable |
| po_item_id | INTEGER |  | nullable |
| pr_item_id | INTEGER |  | nullable |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| uom | STRING |  | nullable |
| dc_id | INTEGER |  | nullable |
| dc_item_id | INTEGER |  | nullable |
| unit_id | INTEGER |  | nullable |
| qty_supplied | DECIMAL |  | nullable |
| dc_qty | DECIMAL |  | nullable |
| work_order | STRING |  | nullable |
| opening | DECIMAL |  | nullable |
| rep | STRING |  | nullable |
| dia | DECIMAL |  | nullable |
| len | DECIMAL |  | nullable |
| wid | DECIMAL |  | nullable |
| thk | DECIMAL |  | nullable |
| kg | DECIMAL |  | nullable |
| recv_kg | DECIMAL |  | nullable |
| accp | DECIMAL |  | nullable |
| phy | DECIMAL |  | nullable |
| weight | DECIMAL |  | nullable |
| pr_no | STRING |  | nullable |
| po_no | STRING |  | nullable |
| supp_qty | DECIMAL |  | nullable |
| ordered_qty | DECIMAL |  | nullable |
| received_qty | DECIMAL |  | nullable |
| accepted_qty | DECIMAL |  | nullable |
| rejected_qty | DECIMAL |  | nullable |
| reject_reason | TEXT |  | nullable |
| rate | DECIMAL |  | nullable |
| gst_rate | DECIMAL |  | nullable |
| gst_amount | DECIMAL |  | nullable |
| amount | DECIMAL |  | nullable |

## ERP.GateEntry  (table: t_gate_entry)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| entry_no | STRING |  | NOT NULL |
| entry_date | DATEONLY |  | NOT NULL |
| entry_type | STRING |  | NOT NULL |
| reference_type | STRING |  | nullable |
| reference_no | STRING |  | nullable |
| party_name | STRING |  | nullable |
| vehicle_no | STRING |  | nullable |
| driver_name | STRING |  | nullable |
| transporter | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| status | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.GateEntryItem  (table: t_gate_entry_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| gate_entry_id | INTEGER |  | NOT NULL |
| item_description | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit | STRING |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.Invoice  (table: t_invoice)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| invoice_no | STRING |  | NOT NULL |
| invoice_date | DATEONLY |  | NOT NULL |
| party_id | INTEGER |  | nullable |
| party_name | STRING |  | nullable |
| party_gstin | STRING |  | nullable |
| address | TEXT |  | nullable |
| place_of_supply | STRING |  | nullable |
| dc_id | INTEGER |  | nullable |
| dc_no | STRING |  | nullable |
| subtotal | DECIMAL |  | nullable |
| total_cgst | DECIMAL |  | nullable |
| total_sgst | DECIMAL |  | nullable |
| total_igst | DECIMAL |  | nullable |
| grand_total | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |
| paid_status | STRING |  | nullable |
| status | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.InvoiceItem  (table: t_invoice_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| invoice_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| hsn_code | STRING |  | nullable |
| quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| rate | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| taxable_amount | DECIMAL |  | nullable |
| cgst_rate | DECIMAL |  | nullable |
| sgst_rate | DECIMAL |  | nullable |
| igst_rate | DECIMAL |  | nullable |
| cgst | DECIMAL |  | nullable |
| sgst | DECIMAL |  | nullable |
| igst | DECIMAL |  | nullable |
| amount | DECIMAL |  | nullable |

## ERP.ItemGroup  (table: m_item_group)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| code | STRING |  | nullable |
| name | STRING |  | NOT NULL |
| description | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |

## ERP.ItemMaster  (table: m_item_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| item_code | STRING |  | NOT NULL |
| item_name | STRING |  | NOT NULL |
| item_description | TEXT |  | nullable |
| group_id | INTEGER |  | nullable |
| subgroup_id | INTEGER |  | nullable |
| type_id | INTEGER |  | nullable |
| subtype_id | INTEGER |  | nullable |
| unit_id | INTEGER |  | nullable |
| hsn_code | STRING |  | nullable |
| gst_rate | DECIMAL |  | nullable |
| brand | STRING |  | nullable |
| opening_stock | DECIMAL |  | nullable |
| current_stock | DECIMAL |  | nullable |
| min_stock | DECIMAL |  | nullable |
| max_stock | DECIMAL |  | nullable |
| reorder_level | DECIMAL |  | nullable |
| min_order_qty | DECIMAL |  | nullable |
| reorder_qty | DECIMAL |  | nullable |
| lead_time_days | INTEGER |  | nullable |
| default_location | STRING |  | nullable |
| abc_class | STRING |  | nullable |
| valuation_method | STRING |  | nullable |
| standard_cost | DECIMAL |  | nullable |
| last_purchase_cost | DECIMAL |  | nullable |
| moving_average_cost | DECIMAL |  | nullable |
| mrp | DECIMAL |  | nullable |
| track_serial | BOOLEAN |  | nullable |
| track_batch | BOOLEAN |  | nullable |
| barcode | STRING |  | nullable |
| barcode_type | STRING |  | nullable |
| attributes | JSON |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_by | STRING |  | nullable |
| updated_by | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| authorized_by | STRING |  | nullable |
| authorized_date | DATE |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.ItemSubGroup  (table: m_item_subgroup)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| group_id | INTEGER |  | NOT NULL |
| code | STRING |  | nullable |
| name | STRING |  | NOT NULL |
| description | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |

## ERP.ItemSubType  (table: m_item_subtype)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| type_id | INTEGER |  | NOT NULL |
| code | STRING |  | nullable |
| name | STRING |  | NOT NULL |
| description | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |

## ERP.ItemType  (table: m_item_type)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| subgroup_id | INTEGER |  | NOT NULL |
| code | STRING |  | nullable |
| name | STRING |  | NOT NULL |
| description | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |

## ERP.JobOrder  (table: t_production_order)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| order_no | STRING |  | NOT NULL |
| bom_id | INTEGER |  | nullable |
| product_item_id | INTEGER |  | nullable |
| product_code | STRING |  | nullable |
| product_name | STRING |  | nullable |
| party_id | INTEGER |  | nullable |
| party_name | STRING |  | nullable |
| planned_quantity | DECIMAL |  | NOT NULL |
| produced_quantity | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| order_type | STRING |  | nullable |
| start_date | DATEONLY |  | nullable |
| end_date | DATEONLY |  | nullable |
| req_date | DATEONLY |  | nullable |
| jo_date | DATEONLY |  | nullable |
| department | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| subject | STRING |  | nullable |
| reference | STRING |  | nullable |
| qtn_no | STRING |  | nullable |
| ref_date | DATEONLY |  | nullable |
| payment_terms | STRING |  | nullable |
| delivery_terms | TEXT |  | nullable |
| insurance | STRING |  | nullable |
| inspection | STRING |  | nullable |
| freight | STRING |  | nullable |
| freight_forward | STRING |  | nullable |
| old_jo_no | STRING |  | nullable |
| jo_year | STRING |  | nullable |
| delivery_period | STRING |  | nullable |
| desp_to | STRING |  | nullable |
| any_other_terms | TEXT |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.JobOrderItem  (table: t_production_order_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| order_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | NOT NULL |
| item_code | STRING |  | NOT NULL |
| item_name | STRING |  | NOT NULL |
| required_quantity | DECIMAL |  | NOT NULL |
| issued_quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |

## ERP.Lead  (table: t_leads)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| lead_no | STRING |  | NOT NULL |
| customer_id | INTEGER |  | nullable |
| contact_name | STRING |  | nullable |
| company_name | STRING |  | nullable |
| email | STRING |  | nullable |
| phone | STRING |  | nullable |
| source | STRING |  | nullable |
| status | ENUM |  | nullable |
| priority | ENUM |  | nullable |
| product_interest | TEXT |  | nullable |
| notes | TEXT |  | nullable |
| assigned_to | INTEGER |  | nullable |
| expected_value | DECIMAL |  | nullable |
| closure_date | DATEONLY |  | nullable |
| lost_reason | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MaintenanceAsset  (table: m_maintenance_asset)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| asset_code | STRING |  | NOT NULL |
| asset_name | STRING |  | NOT NULL |
| asset_type | STRING |  | nullable |
| department | STRING |  | nullable |
| location | STRING |  | nullable |
| purchase_date | DATEONLY |  | nullable |
| purchase_cost | DECIMAL |  | nullable |
| warranty_expiry | DATEONLY |  | nullable |
| status | ENUM |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MaintenanceMachine  (table: m_maintenance_machine)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| machine_code | STRING |  | NOT NULL |
| machine_name | STRING |  | NOT NULL |
| machine_type | STRING |  | nullable |
| department | STRING |  | nullable |
| location | STRING |  | nullable |
| manufacturer | STRING |  | nullable |
| model_no | STRING |  | nullable |
| serial_no | STRING |  | nullable |
| installation_date | DATEONLY |  | nullable |
| status | ENUM |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MaintenanceSchedule  (table: t_maintenance_schedule)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| schedule_no | STRING |  | NOT NULL |
| machine_id | INTEGER |  | nullable |
| asset_id | INTEGER |  | nullable |
| task_name | STRING |  | NOT NULL |
| frequency | STRING |  | nullable |
| last_done_date | DATEONLY |  | nullable |
| next_due_date | DATEONLY |  | nullable |
| assigned_to | STRING |  | nullable |
| status | ENUM |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MaintenanceSettings  (table: m_maintenance_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| setting_key | STRING |  | NOT NULL |
| setting_value | TEXT |  | nullable |
| category | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MarketingSettings  (table: m_marketing_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| key | STRING |  | NOT NULL |
| value | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.MaterialIssue  (table: t_material_issue)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| issue_no | STRING |  | NOT NULL |
| issue_date | DATE |  | NOT NULL |
| issue_type | STRING |  | nullable |
| req_id | INTEGER |  | nullable |
| issued_to | STRING |  | nullable |
| department | STRING |  | nullable |
| issued_by | STRING |  | nullable |
| received_by | STRING |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.MaterialIssueItem  (table: t_material_issue_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| issue_id | INTEGER |  | NOT NULL |
| req_item_id | INTEGER |  | nullable |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| batch_no | STRING |  | nullable |
| rack_id | INTEGER |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.MaterialRequisition  (table: t_material_requisition)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| req_no | STRING |  | NOT NULL |
| req_date | DATE |  | NOT NULL |
| department | STRING |  | nullable |
| requested_by | STRING |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.MaterialRequisitionItem  (table: t_material_requisition_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| req_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| issued_quantity | DECIMAL |  | nullable |
| pending_quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| uom | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| item_status | STRING |  | nullable |

## ERP.MaterialReturn  (table: t_material_return)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| return_no | STRING |  | NOT NULL |
| return_date | DATEONLY |  | NOT NULL |
| return_type | STRING |  | NOT NULL |
| party_id | INTEGER |  | nullable |
| party_name | STRING |  | nullable |
| reference_type | STRING |  | nullable |
| reference_no | STRING |  | nullable |
| returned_by | STRING |  | nullable |
| received_by | STRING |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.MaterialReturnItem  (table: t_material_return_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| return_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| batch_no | STRING |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.MiscVoucher  (table: t_misc_voucher)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| voucher_no | STRING |  | NOT NULL |
| voucher_date | DATEONLY |  | NOT NULL |
| voucher_type | STRING |  | nullable |
| party_name | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| total_amount | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| cancel_remarks | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.MiscVoucherItem  (table: t_misc_voucher_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| voucher_id | INTEGER |  | NOT NULL |
| description | STRING |  | NOT NULL |
| amount | DECIMAL |  | nullable |
| remarks | STRING |  | nullable |

## ERP.NonConformance  (table: t_non_conformance)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| nc_no | STRING |  | NOT NULL |
| inspection_id | INTEGER |  | nullable |
| nc_type | ENUM |  | NOT NULL |
| description | TEXT |  | NOT NULL |
| root_cause | TEXT |  | nullable |
| corrective_action | TEXT |  | nullable |
| preventive_action | TEXT |  | nullable |
| status | ENUM |  | nullable |
| severity | ENUM |  | nullable |
| reported_by | STRING |  | nullable |
| assigned_to | STRING |  | nullable |
| resolution_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.PRAmendment  (table: t_pr_amendment)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| requisition_id | INTEGER |  | NOT NULL |
| amended_by | STRING |  | nullable |
| amendment_date | DATE |  | nullable |
| change_summary | TEXT |  | nullable |
| old_value | JSONB |  | nullable |
| new_value | JSONB |  | nullable |

## ERP.PlanningCapacity  (table: t_planning_capacity)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| plan_no | STRING |  | NOT NULL |
| work_center | STRING |  | nullable |
| date | DATEONLY |  | nullable |
| available_capacity | DECIMAL |  | nullable |
| used_capacity | DECIMAL |  | nullable |
| load_percentage | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.PlanningMRP  (table: t_planning_mrp)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| run_no | STRING |  | NOT NULL |
| run_date | DATEONLY |  | nullable |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | nullable |
| gross_requirement | DECIMAL |  | nullable |
| scheduled_receipts | DECIMAL |  | nullable |
| net_requirement | DECIMAL |  | nullable |
| planned_orders | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.PlanningSchedule  (table: t_planning_schedule)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| schedule_no | STRING |  | NOT NULL |
| order_id | INTEGER |  | nullable |
| machine_id | INTEGER |  | nullable |
| scheduled_date | DATEONLY |  | nullable |
| shift | STRING |  | nullable |
| planned_qty | DECIMAL |  | nullable |
| status | ENUM |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.PlanningSettings  (table: m_planning_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| setting_key | STRING |  | NOT NULL |
| setting_value | TEXT |  | nullable |
| category | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.ProductCategory  (table: m_product_category)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| name | STRING |  | NOT NULL |
| type | STRING |  | NOT NULL |
| parent_id | INTEGER |  | nullable |
| description | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.ProductItemMaster  (table: m_product_item_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| product_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | NOT NULL |
| item_code | STRING |  | NOT NULL |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| wastage_percent | DECIMAL |  | nullable |
| created_date | DATEONLY |  | nullable |

## ERP.ProductMaster  (table: m_product_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| product_uid | STRING |  | NOT NULL |
| product_type | STRING |  | nullable |
| node_type | STRING |  | NOT NULL |
| parent_id | INTEGER |  | nullable |
| product_code | STRING |  | nullable |
| part_name | STRING |  | nullable |
| color | STRING |  | nullable |
| category_id | INTEGER |  | nullable |
| item_id | INTEGER |  | nullable |
| description | STRING |  | nullable |
| finish_type | STRING |  | nullable |
| assembly_qty | DECIMAL |  | NOT NULL |
| qty_per_pallet | DECIMAL |  | nullable |
| created_by | INTEGER |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.ProductionDailyEntry  (table: t_production_daily_entry)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| entry_date | DATEONLY |  | NOT NULL |
| shift | ENUM |  | nullable |
| machine_id | INTEGER |  | nullable |
| machine_code | STRING |  | nullable |
| machine_name | STRING |  | nullable |
| order_id | INTEGER |  | nullable |
| order_no | STRING |  | nullable |
| product_code | STRING |  | nullable |
| product_name | STRING |  | nullable |
| operator_name | STRING |  | nullable |
| planned_qty | DECIMAL |  | nullable |
| produced_qty | DECIMAL |  | nullable |
| rejected_qty | DECIMAL |  | nullable |
| downtime_minutes | INTEGER |  | nullable |
| downtime_reason | TEXT |  | nullable |
| notes | TEXT |  | nullable |
| status | ENUM |  | nullable |
| recorded_by | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.ProductionDowntime  (table: t_production_downtime)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| machine_id | INTEGER |  | NOT NULL |
| machine_code | STRING |  | nullable |
| machine_name | STRING |  | nullable |
| downtime_date | DATEONLY |  | NOT NULL |
| start_time | TIME |  | nullable |
| end_time | TIME |  | nullable |
| duration_minutes | INTEGER |  | nullable |
| category | ENUM |  | nullable |
| reason | TEXT |  | nullable |
| action_taken | TEXT |  | nullable |
| reported_by | STRING |  | nullable |
| resolved_by | STRING |  | nullable |
| status | ENUM |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.ProductionMachine  (table: m_production_machine)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| machine_code | STRING |  | NOT NULL |
| machine_name | STRING |  | NOT NULL |
| machine_type | STRING |  | nullable |
| department | STRING |  | nullable |
| location | STRING |  | nullable |
| manufacturer | STRING |  | nullable |
| model_no | STRING |  | nullable |
| serial_no | STRING |  | nullable |
| installation_date | DATEONLY |  | nullable |
| capacity_per_hour | DECIMAL |  | nullable |
| power_rating | STRING |  | nullable |
| status | ENUM |  | nullable |
| last_maintenance_date | DATEONLY |  | nullable |
| next_maintenance_date | DATEONLY |  | nullable |
| notes | TEXT |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.ProductionSettings  (table: m_production_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| key | STRING |  | NOT NULL |
| value | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.PurchaseOrder  (table: t_purchase_order)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| po_no | STRING |  | NOT NULL |
| po_date | DATE |  | NOT NULL |
| req_date | DATEONLY |  | nullable |
| supplier_id | INTEGER |  | NOT NULL |
| requisition_id | INTEGER |  | nullable |
| status | STRING |  | nullable |
| payment_terms | STRING |  | nullable |
| delivery_terms | TEXT |  | nullable |
| subtotal | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| discount_amount | DECIMAL |  | nullable |
| tax_amount | DECIMAL |  | nullable |
| grand_total | DECIMAL |  | nullable |
| currency | STRING |  | nullable |
| notes | TEXT |  | nullable |
| old_po_no | STRING |  | nullable |
| old_po_year | STRING |  | nullable |
| subject | STRING |  | nullable |
| reference | STRING |  | nullable |
| qtn_no | STRING |  | nullable |
| ref_date | DATEONLY |  | nullable |
| qca_req | TEXT |  | nullable |
| any_other_terms | TEXT |  | nullable |
| delivery_period | STRING |  | nullable |
| desp_to | TEXT |  | nullable |
| insurance | STRING |  | nullable |
| rem1 | STRING |  | nullable |
| rem2 | STRING |  | nullable |
| rem3 | STRING |  | nullable |
| inspection | STRING |  | nullable |
| freight | STRING |  | nullable |
| freight_forward | STRING |  | nullable |
| currency_val | STRING |  | nullable |
| req_yn | STRING |  | nullable |
| ven_code | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.PurchaseOrderItem  (table: t_purchase_order_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| po_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| hs_code | STRING |  | nullable |
| pr_no | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| received_quantity | DECIMAL |  | nullable |
| unit_id | INTEGER |  | nullable |
| rate | DECIMAL |  | nullable |
| amount | DECIMAL |  | nullable |
| gst_rate | DECIMAL |  | nullable |
| gst_amount | DECIMAL |  | nullable |
| total | DECIMAL |  | nullable |
| act_wt | DECIMAL |  | nullable |
| off_wt | DECIMAL |  | nullable |
| disc_percent | DECIMAL |  | nullable |
| disc_inr | DECIMAL |  | nullable |
| after_disc | DECIMAL |  | nullable |
| pf_percent | DECIMAL |  | nullable |
| pf_inr | DECIMAL |  | nullable |
| taxable_value | DECIMAL |  | nullable |
| sgst_rate | DECIMAL |  | nullable |
| sgst_inr | DECIMAL |  | nullable |
| cgst_rate | DECIMAL |  | nullable |
| cgst_inr | DECIMAL |  | nullable |
| igst_rate | DECIMAL |  | nullable |
| igst_inr | DECIMAL |  | nullable |
| total_value | DECIMAL |  | nullable |
| req_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| delivery_date | DATEONLY |  | nullable |

## ERP.PurchaseRequisition  (table: t_purchase_requisition)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| req_no | STRING |  | NOT NULL |
| req_date | DATEONLY |  | NOT NULL |
| department | STRING |  | nullable |
| sub_department | STRING |  | nullable |
| requested_by | STRING |  | nullable |
| indent_type | STRING |  | nullable |
| status | STRING |  | nullable |
| priority | STRING |  | nullable |
| notes | TEXT |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.PurchaseRequisitionItem  (table: t_purchase_requisition_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| requisition_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| expected_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| cost_center | STRING |  | nullable |
| uom | STRING |  | nullable |
| purpose | STRING |  | nullable |
| len | DECIMAL |  | nullable |
| item_no | STRING |  | nullable |
| kg | DECIMAL |  | nullable |
| mat_code | STRING |  | nullable |
| mat_desc | STRING |  | nullable |
| est_cost | DECIMAL |  | nullable |

## ERP.PurchaseRequisitionSanction  (table: t_pr_sanction)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| requisition_id | INTEGER |  | NOT NULL |
| pr_item_id | INTEGER |  | NOT NULL |
| supplier_id | INTEGER |  | NOT NULL |
| sanctioned_qty | DECIMAL |  | NOT NULL |
| rate | DECIMAL |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| sanctioned_by | STRING |  | nullable |
| sanctioned_date | DATE |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.PurchaseReturn  (table: t_purchase_return)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| return_no | STRING |  | NOT NULL |
| return_date | DATEONLY |  | NOT NULL |
| supplier_id | INTEGER |  | NOT NULL |
| po_id | INTEGER |  | nullable |
| grn_id | INTEGER |  | nullable |
| debit_note_no | STRING |  | nullable |
| debit_note_date | DATEONLY |  | nullable |
| return_reason | STRING |  | NOT NULL |
| return_type | STRING |  | nullable |
| status | STRING |  | nullable |
| subtotal | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| discount_amount | DECIMAL |  | nullable |
| taxable_amount | DECIMAL |  | nullable |
| cgst_amount | DECIMAL |  | nullable |
| sgst_amount | DECIMAL |  | nullable |
| igst_amount | DECIMAL |  | nullable |
| total_gst | DECIMAL |  | nullable |
| grand_total | DECIMAL |  | nullable |
| currency | STRING |  | nullable |
| exchange_rate | DECIMAL |  | nullable |
| tds_applicable | BOOLEAN |  | nullable |
| tds_section | STRING |  | nullable |
| tds_rate | DECIMAL |  | nullable |
| tds_amount | DECIMAL |  | nullable |
| tcs_applicable | BOOLEAN |  | nullable |
| tcs_rate | DECIMAL |  | nullable |
| tcs_amount | DECIMAL |  | nullable |
| warehouse_id | INTEGER |  | nullable |
| remarks | TEXT |  | nullable |
| prepared_by | STRING |  | nullable |
| approved_by | STRING |  | nullable |
| approved_date | DATE |  | nullable |
| rejected_by | STRING |  | nullable |
| rejected_date | DATE |  | nullable |
| rejection_reason | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.PurchaseReturnItem  (table: t_purchase_return_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| return_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| po_item_id | INTEGER |  | nullable |
| grn_item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| description | TEXT |  | nullable |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| rate | DECIMAL |  | nullable |
| amount | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| discount_amount | DECIMAL |  | nullable |
| taxable_amount | DECIMAL |  | nullable |
| gst_rate | DECIMAL |  | nullable |
| cgst_rate | DECIMAL |  | nullable |
| sgst_rate | DECIMAL |  | nullable |
| igst_rate | DECIMAL |  | nullable |
| cgst_amount | DECIMAL |  | nullable |
| sgst_amount | DECIMAL |  | nullable |
| igst_amount | DECIMAL |  | nullable |
| total_gst | DECIMAL |  | nullable |
| batch_no | STRING |  | nullable |
| serial_no | STRING |  | nullable |
| hsn_code | STRING |  | nullable |
| received_qty | DECIMAL |  | nullable |
| returned_qty | DECIMAL |  | nullable |
| pending_qty | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.PurchaseSettings  (table: m_purchase_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| pr_prefix | STRING |  | nullable |
| po_prefix | STRING |  | nullable |
| rfq_prefix | STRING |  | nullable |
| grn_prefix | STRING |  | nullable |
| fin_year_format | STRING |  | nullable |
| default_payment_terms | STRING |  | nullable |
| default_delivery_terms | TEXT |  | nullable |
| default_currency | STRING |  | nullable |
| default_gst_rate | DECIMAL |  | nullable |
| req_approval_required | BOOLEAN |  | nullable |
| po_approval_required | BOOLEAN |  | nullable |
| req_approval_limit | DECIMAL |  | nullable |
| po_approval_limit | DECIMAL |  | nullable |
| auto_generate_pr | BOOLEAN |  | nullable |
| auto_generate_po | BOOLEAN |  | nullable |
| auto_generate_rfq | BOOLEAN |  | nullable |
| auto_generate_grn | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.QualityInspection  (table: t_quality_inspection)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| inspection_no | STRING |  | NOT NULL |
| inspection_type | ENUM |  | NOT NULL |
| reference_type | STRING |  | nullable |
| reference_id | INTEGER |  | nullable |
| reference_no | STRING |  | nullable |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | nullable |
| supplier_id | INTEGER |  | nullable |
| supplier_name | STRING |  | nullable |
| batch_no | STRING |  | nullable |
| inspected_qty | DECIMAL |  | nullable |
| accepted_qty | DECIMAL |  | nullable |
| rejected_qty | DECIMAL |  | nullable |
| status | ENUM |  | nullable |
| inspector | STRING |  | nullable |
| inspection_date | DATEONLY |  | nullable |
| result | TEXT |  | nullable |
| remarks | TEXT |  | nullable |
| created_by | INTEGER |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.QualityInspectionItem  (table: t_quality_inspection_items)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| inspection_id | INTEGER |  | NOT NULL |
| parameter | STRING |  | NOT NULL |
| specification | STRING |  | nullable |
| method | STRING |  | nullable |
| observed_value | STRING |  | nullable |
| result | ENUM |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.QualitySettings  (table: m_quality_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| key | STRING |  | NOT NULL |
| value | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.Quotation  (table: t_quotations)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| quote_no | STRING |  | NOT NULL |
| customer_id | INTEGER |  | NOT NULL |
| lead_id | INTEGER |  | nullable |
| date | DATEONLY |  | NOT NULL |
| valid_until | DATEONLY |  | nullable |
| subject | STRING |  | nullable |
| subtotal | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| discount_amount | DECIMAL |  | nullable |
| tax_rate | DECIMAL |  | nullable |
| tax_amount | DECIMAL |  | nullable |
| shipping_charges | DECIMAL |  | nullable |
| total_amount | DECIMAL |  | nullable |
| status | ENUM |  | nullable |
| terms | TEXT |  | nullable |
| notes | TEXT |  | nullable |
| created_by | INTEGER |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.QuotationItem  (table: t_quotation_items)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| quotation_id | INTEGER |  | NOT NULL |
| item_description | TEXT |  | NOT NULL |
| quantity | DECIMAL |  | nullable |
| unit | STRING |  | nullable |
| unit_price | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| net_price | DECIMAL |  | nullable |
| total_price | DECIMAL |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.RFQ  (table: t_rfq)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| rfq_no | STRING |  | NOT NULL |
| rfq_date | DATEONLY |  | NOT NULL |
| subject | STRING |  | nullable |
| status | STRING |  | nullable |
| closing_date | DATEONLY |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.RFQItem  (table: t_rfq_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| rfq_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| gst_rate | DECIMAL |  | nullable |

## ERP.RFQVendor  (table: t_rfq_vendor)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| rfq_id | INTEGER |  | NOT NULL |
| supplier_id | INTEGER |  | NOT NULL |
| quoted_amount | DECIMAL |  | nullable |
| gst_rate | DECIMAL |  | nullable |
| gst_amount | DECIMAL |  | nullable |
| total_amount | DECIMAL |  | nullable |
| delivery_days | INTEGER |  | nullable |
| validity_days | INTEGER |  | nullable |
| remarks | TEXT |  | nullable |
| is_selected | BOOLEAN |  | nullable |

## ERP.SalesOrder  (table: t_sales_orders)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| order_no | STRING |  | NOT NULL |
| customer_id | INTEGER |  | NOT NULL |
| quotation_id | INTEGER |  | nullable |
| order_date | DATEONLY |  | NOT NULL |
| delivery_date | DATEONLY |  | nullable |
| subtotal | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| discount_amount | DECIMAL |  | nullable |
| tax_rate | DECIMAL |  | nullable |
| tax_amount | DECIMAL |  | nullable |
| shipping_charges | DECIMAL |  | nullable |
| total_amount | DECIMAL |  | nullable |
| status | ENUM |  | nullable |
| payment_terms | STRING |  | nullable |
| delivery_terms | TEXT |  | nullable |
| notes | TEXT |  | nullable |
| created_by | INTEGER |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SalesOrderItem  (table: t_sales_order_items)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| sales_order_id | INTEGER |  | NOT NULL |
| item_description | TEXT |  | NOT NULL |
| quantity | DECIMAL |  | nullable |
| unit | STRING |  | nullable |
| unit_price | DECIMAL |  | nullable |
| discount_percent | DECIMAL |  | nullable |
| net_price | DECIMAL |  | nullable |
| total_price | DECIMAL |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.StockAudit  (table: t_stock_audit)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| audit_no | STRING |  | NOT NULL |
| audit_date | DATEONLY |  | NOT NULL |
| warehouse | STRING |  | nullable |
| auditor | STRING |  | nullable |
| status | STRING |  | nullable |
| remarks | TEXT |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.StockAuditItem  (table: t_stock_audit_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| audit_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| system_qty | DECIMAL |  | NOT NULL |
| physical_qty | DECIMAL |  | NOT NULL |
| variance_qty | DECIMAL |  | NOT NULL |
| unit_id | INTEGER |  | nullable |
| remarks | TEXT |  | nullable |

## ERP.StockLedger  (table: t_stock_ledger)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| ledger_date | DATE |  | NOT NULL |
| ledger_time | STRING |  | nullable |
| doc_no | STRING |  | nullable |
| ref_type | STRING |  | NOT NULL |
| ref_no | STRING |  | nullable |
| reference | STRING |  | nullable |
| warehouse_id | INTEGER |  | nullable |
| item_id | INTEGER |  | NOT NULL |
| batch_id | INTEGER |  | nullable |
| serial_no | STRING |  | nullable |
| qty_in | DECIMAL |  | nullable |
| qty_out | DECIMAL |  | nullable |
| unit_cost | DECIMAL |  | nullable |
| selling_price | DECIMAL |  | nullable |
| stock_value | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| reversal_of | INTEGER |  | nullable |
| created_date | DATE |  | nullable |

## ERP.StoresSettings  (table: m_stores_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| mr_prefix | STRING |  | nullable |
| mi_prefix | STRING |  | nullable |
| grn_prefix | STRING |  | nullable |
| pr_prefix | STRING |  | nullable |
| po_prefix | STRING |  | nullable |
| rfq_prefix | STRING |  | nullable |
| ir_prefix | STRING |  | nullable |
| ge_prefix_in | STRING |  | nullable |
| ge_prefix_out | STRING |  | nullable |
| bill_prefix | STRING |  | nullable |
| voucher_prefix | STRING |  | nullable |
| show_format_no | BOOLEAN |  | nullable |
| dc_format_no | STRING |  | nullable |
| qc_prefix_iqc | STRING |  | nullable |
| qc_prefix_ipc | STRING |  | nullable |
| qc_prefix_fqc | STRING |  | nullable |
| audit_prefix | STRING |  | nullable |
| stock_adj_prefix | STRING |  | nullable |
| transfer_prefix | STRING |  | nullable |
| dc_prefix_sale_approval | STRING |  | nullable |
| dc_prefix_labour | STRING |  | nullable |
| dc_prefix_repair | STRING |  | nullable |
| dc_prefix_maintenance | STRING |  | nullable |
| dc_prefix_jobwork | STRING |  | nullable |
| dc_prefix_nonreturn | STRING |  | nullable |
| auto_generate_mr | BOOLEAN |  | nullable |
| auto_generate_mi | BOOLEAN |  | nullable |
| auto_generate_grn | BOOLEAN |  | nullable |
| auto_generate_pr | BOOLEAN |  | nullable |
| auto_generate_po | BOOLEAN |  | nullable |
| auto_generate_rfq | BOOLEAN |  | nullable |
| auto_generate_dc | BOOLEAN |  | nullable |
| auto_generate_ir | BOOLEAN |  | nullable |
| auto_generate_bill | BOOLEAN |  | nullable |
| auto_generate_voucher | BOOLEAN |  | nullable |
| auto_generate_qc | BOOLEAN |  | nullable |
| auto_generate_audit | BOOLEAN |  | nullable |
| auto_generate_adj | BOOLEAN |  | nullable |
| auto_generate_transfer | BOOLEAN |  | nullable |
| mr_start_no | INTEGER |  | nullable |
| mi_start_no | INTEGER |  | nullable |
| grn_start_no | INTEGER |  | nullable |
| pr_start_no | INTEGER |  | nullable |
| po_start_no | INTEGER |  | nullable |
| rfq_start_no | INTEGER |  | nullable |
| ir_start_no | INTEGER |  | nullable |
| ge_start_no | INTEGER |  | nullable |
| audit_start_no | INTEGER |  | nullable |
| bill_start_no | INTEGER |  | nullable |
| voucher_start_no | INTEGER |  | nullable |
| adj_start_no | INTEGER |  | nullable |
| transfer_start_no | INTEGER |  | nullable |
| default_warehouse | STRING |  | nullable |
| bin_location_required | BOOLEAN |  | nullable |
| enforce_bin_on_receipt | BOOLEAN |  | nullable |
| enforce_bin_on_issue | BOOLEAN |  | nullable |
| allow_multi_warehouse | BOOLEAN |  | nullable |
| valuation_method | ENUM |  | nullable |
| standard_cost_update_on_grn | BOOLEAN |  | nullable |
| decimal_precision_qty | INTEGER |  | nullable |
| decimal_precision_cost | INTEGER |  | nullable |
| batch_tracking_enabled | BOOLEAN |  | nullable |
| enforce_batch_on_receipt | BOOLEAN |  | nullable |
| enforce_batch_on_issue | BOOLEAN |  | nullable |
| enforce_fefo_on_issue | BOOLEAN |  | nullable |
| expiry_warning_days | INTEGER |  | nullable |
| serial_tracking_enabled | BOOLEAN |  | nullable |
| enforce_serial_on_issue | BOOLEAN |  | nullable |
| negative_stock_allowed | BOOLEAN |  | nullable |
| allow_backdated_entries | BOOLEAN |  | nullable |
| max_backdate_days | INTEGER |  | nullable |
| low_stock_alert | BOOLEAN |  | nullable |
| reorder_auto_create_pr | BOOLEAN |  | nullable |
| stock_reservation_enabled | BOOLEAN |  | nullable |
| grn_requires_qa | BOOLEAN |  | nullable |
| grn_requires_approval | BOOLEAN |  | nullable |
| mi_requires_approval | BOOLEAN |  | nullable |
| dc_requires_approval | BOOLEAN |  | nullable |
| stock_adj_requires_approval | BOOLEAN |  | nullable |
| stock_adj_approval_limit | DECIMAL |  | nullable |
| aging_bucket_days | INTEGER |  | nullable |
| slow_moving_months | INTEGER |  | nullable |
| dead_stock_days | INTEGER |  | nullable |
| default_min_stock | DECIMAL |  | nullable |
| default_reorder_level | DECIMAL |  | nullable |
| default_max_stock | DECIMAL |  | nullable |
| default_uom_id | INTEGER |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.SubcontractIssue  (table: t_subcontract_issue)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| issue_no | STRING |  | NOT NULL |
| order_id | INTEGER |  | NOT NULL |
| issue_date | DATEONLY |  | NOT NULL |
| vendor_id | INTEGER |  | nullable |
| vendor_name | STRING |  | nullable |
| status | STRING |  | nullable |
| notes | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractIssueItem  (table: t_subcontract_issue_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| issue_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| uom | STRING |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractOrder  (table: t_subcontract_order)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| order_no | STRING |  | NOT NULL |
| vendor_id | INTEGER |  | NOT NULL |
| vendor_name | STRING |  | nullable |
| order_date | DATEONLY |  | NOT NULL |
| expected_date | DATEONLY |  | nullable |
| status | STRING |  | nullable |
| total_qty | DECIMAL |  | nullable |
| total_amount | DECIMAL |  | nullable |
| notes | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractOrderItem  (table: t_subcontract_order_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| order_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| uom | STRING |  | nullable |
| rate | DECIMAL |  | nullable |
| amount | DECIMAL |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractReceipt  (table: t_subcontract_receipt)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| receipt_no | STRING |  | NOT NULL |
| order_id | INTEGER |  | NOT NULL |
| receipt_date | DATEONLY |  | NOT NULL |
| vendor_id | INTEGER |  | nullable |
| vendor_name | STRING |  | nullable |
| status | STRING |  | nullable |
| notes | TEXT |  | nullable |
| created_by | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractReceiptItem  (table: t_subcontract_receipt_item)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| receipt_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | nullable |
| item_code | STRING |  | nullable |
| item_name | STRING |  | NOT NULL |
| quantity | DECIMAL |  | NOT NULL |
| accepted_qty | DECIMAL |  | nullable |
| uom | STRING |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SubcontractSettings  (table: m_subcontract_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| setting_key | STRING |  | NOT NULL |
| setting_value | TEXT |  | nullable |
| category | STRING |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## ERP.SupplierMaster  (table: m_party_master)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| party_type | STRING |  | nullable |
| supplier_code | STRING |  | NOT NULL |
| supplier_name | STRING |  | NOT NULL |
| contact_person | STRING |  | nullable |
| email | STRING |  | nullable |
| phone | STRING |  | nullable |
| mobile | STRING |  | nullable |
| address_line1 | STRING |  | nullable |
| address_line2 | STRING |  | nullable |
| city | STRING |  | nullable |
| state | STRING |  | nullable |
| pincode | STRING |  | nullable |
| gstin | STRING |  | nullable |
| gst_registration_type | STRING |  | nullable |
| pan_no | STRING |  | nullable |
| msme_reg_no | STRING |  | nullable |
| msme_type | STRING |  | nullable |
| payment_terms | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.Unit  (table: m_unit)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| name | STRING |  | NOT NULL |
| short_name | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.VendorPriceList  (table: m_vendor_price_list)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| supplier_id | INTEGER |  | NOT NULL |
| item_id | INTEGER |  | NOT NULL |
| rate | DECIMAL |  | NOT NULL |
| gst_rate | DECIMAL |  | nullable |
| currency | STRING |  | nullable |
| effective_from | DATEONLY |  | nullable |
| effective_to | DATEONLY |  | nullable |
| moq | DECIMAL |  | nullable |
| lead_days | INTEGER |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## ERP.VendorRating  (table: t_vendor_rating)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| supplier_id | INTEGER |  | NOT NULL |
| po_id | INTEGER |  | nullable |
| quality_score | DECIMAL |  | nullable |
| delivery_score | DECIMAL |  | nullable |
| price_score | DECIMAL |  | nullable |
| service_score | DECIMAL |  | nullable |
| overall_score | DECIMAL |  | nullable |
| remarks | TEXT |  | nullable |
| rated_by | STRING |  | nullable |
| rating_date | DATEONLY |  | nullable |

## ERP.Warehouse  (table: m_warehouse)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| warehouse_code | STRING |  | NOT NULL |
| warehouse_name | STRING |  | NOT NULL |
| location | STRING |  | nullable |
| is_active | BOOLEAN |  | nullable |
| created_date | DATEONLY |  | nullable |
| updated_at | DATE |  | nullable |

## Accounts.AccountsSettings  (table: accounts_settings)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| key | STRING |  | NOT NULL |
| value | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.Budget  (table: budgets)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| financial_year_id | INTEGER |  | NOT NULL |
| account_id | INTEGER |  | NOT NULL |
| jan | DECIMAL |  | nullable |
| feb | DECIMAL |  | nullable |
| mar | DECIMAL |  | nullable |
| apr | DECIMAL |  | nullable |
| may | DECIMAL |  | nullable |
| jun | DECIMAL |  | nullable |
| jul | DECIMAL |  | nullable |
| aug | DECIMAL |  | nullable |
| sep | DECIMAL |  | nullable |
| oct | DECIMAL |  | nullable |
| nov | DECIMAL |  | nullable |
| dec | DECIMAL |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.ChartOfAccount  (table: chart_of_accounts)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| account_code | STRING |  | NOT NULL |
| account_name | STRING |  | NOT NULL |
| account_type | ENUM |  | NOT NULL |
| parent_id | INTEGER |  | nullable |
| is_group | BOOLEAN |  | nullable |
| is_active | BOOLEAN |  | nullable |
| opening_balance | DECIMAL |  | nullable |
| opening_balance_type | ENUM |  | nullable |
| notes | TEXT |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.FinancialYear  (table: financial_years)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| name | STRING |  | NOT NULL |
| start_date | DATEONLY |  | NOT NULL |
| end_date | DATEONLY |  | NOT NULL |
| is_active | BOOLEAN |  | nullable |
| is_closed | BOOLEAN |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.Voucher  (table: vouchers)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| voucher_no | STRING |  | NOT NULL |
| voucher_type_id | INTEGER |  | NOT NULL |
| financial_year_id | INTEGER |  | nullable |
| date | DATEONLY |  | NOT NULL |
| reference_no | STRING |  | nullable |
| reference_date | DATEONLY |  | nullable |
| narration | TEXT |  | nullable |
| total_debit | DECIMAL |  | nullable |
| total_credit | DECIMAL |  | nullable |
| status | ENUM |  | nullable |
| created_by | INTEGER |  | nullable |
| approved_by | INTEGER |  | nullable |
| approved_at | DATE |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.VoucherItem  (table: voucher_items)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| voucher_id | INTEGER |  | NOT NULL |
| account_id | INTEGER |  | NOT NULL |
| debit | DECIMAL |  | nullable |
| credit | DECIMAL |  | nullable |
| against_account_id | INTEGER |  | nullable |
| reference_no | STRING |  | nullable |
| narration | TEXT |  | nullable |
| cost_center_id | INTEGER |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |

## Accounts.VoucherType  (table: voucher_types)
| Column | Type | PK | Null |
|---|---|---|---|
| id | INTEGER | PK | nullable |
| code | STRING |  | NOT NULL |
| name | STRING |  | NOT NULL |
| is_active | BOOLEAN |  | nullable |
| created_date | DATE |  | NOT NULL |
| updated_at | DATE |  | NOT NULL |
