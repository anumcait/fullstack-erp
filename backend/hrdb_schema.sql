--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_chart_of_accounts_account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_chart_of_accounts_account_type AS ENUM (
    'Asset',
    'Liability',
    'Equity',
    'Income',
    'Expense'
);


--
-- Name: enum_chart_of_accounts_opening_balance_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_chart_of_accounts_opening_balance_type AS ENUM (
    'Dr',
    'Cr'
);


--
-- Name: enum_employee_master_employment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_employee_master_employment_status AS ENUM (
    'Active',
    'Resigned',
    'Terminated',
    'On Leave',
    'Permanent',
    'Contract',
    'Intern'
);


--
-- Name: enum_employee_master_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_employee_master_gender AS ENUM (
    'M',
    'F',
    'O'
);


--
-- Name: enum_employee_master_marital_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_employee_master_marital_status AS ENUM (
    'Single',
    'Married',
    'Divorced',
    'Widowed'
);


--
-- Name: enum_m_maintenance_asset_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_m_maintenance_asset_status AS ENUM (
    'Active',
    'Inactive',
    'Disposed'
);


--
-- Name: enum_m_maintenance_machine_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_m_maintenance_machine_status AS ENUM (
    'Active',
    'Inactive',
    'Under Maintenance',
    'Retired'
);


--
-- Name: enum_m_production_machine_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_m_production_machine_status AS ENUM (
    'Active',
    'Inactive',
    'Under Maintenance',
    'Retired'
);


--
-- Name: enum_profile_update_requests_request_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_profile_update_requests_request_type AS ENUM (
    'address',
    'phone',
    'both'
);


--
-- Name: enum_profile_update_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_profile_update_requests_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected'
);


--
-- Name: enum_t_leads_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_leads_priority AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);


--
-- Name: enum_t_leads_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_leads_status AS ENUM (
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost'
);


--
-- Name: enum_t_maintenance_schedule_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_maintenance_schedule_status AS ENUM (
    'Pending',
    'Overdue',
    'Completed'
);


--
-- Name: enum_t_material_requisition_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_material_requisition_status AS ENUM (
    'Draft',
    'Pending',
    'Approved',
    'Partially Issued',
    'Issued',
    'Closed',
    'Cancelled'
);


--
-- Name: enum_t_non_conformance_nc_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_non_conformance_nc_type AS ENUM (
    'Critical',
    'Major',
    'Minor'
);


--
-- Name: enum_t_non_conformance_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_non_conformance_severity AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);


--
-- Name: enum_t_non_conformance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_non_conformance_status AS ENUM (
    'Open',
    'In Progress',
    'Resolved',
    'Closed'
);


--
-- Name: enum_t_planning_schedule_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_planning_schedule_status AS ENUM (
    'Planned',
    'InProgress',
    'Completed',
    'Cancelled'
);


--
-- Name: enum_t_production_daily_entry_shift; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_production_daily_entry_shift AS ENUM (
    'General',
    'A',
    'B',
    'C'
);


--
-- Name: enum_t_production_daily_entry_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_production_daily_entry_status AS ENUM (
    'Pending',
    'Completed',
    'Approved'
);


--
-- Name: enum_t_production_downtime_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_production_downtime_category AS ENUM (
    'Breakdown',
    'Setup',
    'Maintenance',
    'No Material',
    'No Operator',
    'Power Failure',
    'Other'
);


--
-- Name: enum_t_production_downtime_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_production_downtime_status AS ENUM (
    'Open',
    'Resolved',
    'Closed'
);


--
-- Name: enum_t_quality_inspection_inspection_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_quality_inspection_inspection_type AS ENUM (
    'Incoming',
    'In-Process',
    'Final'
);


--
-- Name: enum_t_quality_inspection_items_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_quality_inspection_items_result AS ENUM (
    'Pass',
    'Fail',
    'N/A'
);


--
-- Name: enum_t_quality_inspection_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_quality_inspection_status AS ENUM (
    'Pending',
    'In Progress',
    'Passed',
    'Partial',
    'Rejected'
);


--
-- Name: enum_t_quotations_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_quotations_status AS ENUM (
    'Draft',
    'Sent',
    'Accepted',
    'Rejected',
    'Expired'
);


--
-- Name: enum_t_sales_orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_t_sales_orders_status AS ENUM (
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
);


--
-- Name: enum_vouchers_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_vouchers_status AS ENUM (
    'Draft',
    'Posted',
    'Cancelled'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Departments" (
    "DeptId" integer NOT NULL,
    "DeptName" text NOT NULL
);


--
-- Name: Departments_DeptId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Departments" ALTER COLUMN "DeptId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Departments_DeptId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: EQ_EMP_GATT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EQ_EMP_GATT" (
    id integer NOT NULL,
    "C_EMPID" integer NOT NULL,
    "C_DATE" date NOT NULL,
    "C_SHIFT" character varying(10),
    "C_SIN" time without time zone,
    "C_SOUT" time without time zone,
    "C_LIN" time without time zone,
    "C_LOUT" time without time zone,
    "C_LATE_HRS" numeric(5,2),
    "C_LATE_MINS" numeric(5,2),
    "C_OT_HRS" numeric(5,2),
    "C_OT_MINS" numeric(5,2),
    "C_STATUS" character varying(20),
    "C_LEAVE_TYPE" character varying(20),
    "C_LOP_DAYS" numeric(5,2),
    "C_WOFF_DAYS" numeric(5,2),
    "C_HOLIDAY" boolean,
    "C_REMARKS" character varying(100),
    "C_UNIT" character varying(40),
    "C_DIVISION" character varying(40),
    "C_FINAL_STATUS" character varying(20) DEFAULT '0'::character varying,
    "C_GEMPID" character varying(40),
    created_date date
);


--
-- Name: EQ_EMP_GATT_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EQ_EMP_GATT_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EQ_EMP_GATT_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EQ_EMP_GATT_id_seq" OWNED BY public."EQ_EMP_GATT".id;


--
-- Name: EQ_EMP_PAYSLIP; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EQ_EMP_PAYSLIP" (
    "C_MONTH" character varying(10) NOT NULL,
    "C_YEAR" integer NOT NULL,
    "C_EMPID" integer NOT NULL,
    "C_ENAME" character varying(100),
    "C_DESIG" character varying(70),
    "C_DEPT" character varying(40),
    "C_TOT_DAYS" numeric(5,2),
    "C_DAYS_PRESENT" numeric(5,2),
    "C_LEAVES_ALLOWED" numeric(5,2),
    "C_WOFF_HOL" numeric(5,2),
    "C_ABSENT_DAYS" numeric(5,2),
    "C_LATE_COMING" numeric(5,2),
    "C_PF_NUM" character varying(50),
    "C_ESI_NUM" character varying(50),
    "C_BASIC" numeric(10,2),
    "C_HRA" numeric(10,2),
    "C_CONV" numeric(10,2),
    "C_OTHERS" numeric(10,2),
    "C_TOT_SAL" numeric(10,2),
    "C_EARNED_BASIC" numeric(10,2),
    "C_EARNED_HRA" numeric(10,2),
    "C_EARNED_CONV" numeric(10,2),
    "C_EARNED_OTHERS" numeric(10,2),
    "C_EARNED_AB" numeric(10,2),
    "C_EARNED_OT" numeric(10,2),
    "C_EARNED_LUNCH" numeric(10,2),
    "C_EARNED_GROSS" numeric(10,2),
    "C_DED_PF" numeric(10,2),
    "C_DED_ESI" numeric(10,2),
    "C_DED_PT" numeric(10,2),
    "C_DED_LIC" numeric(10,2),
    "C_DED_TAX" numeric(10,2),
    "C_DED_ADV" numeric(10,2),
    "C_DED_OTH" numeric(10,2),
    "C_TOT_DED" numeric(10,2),
    "C_NET_AMT" numeric(10,2),
    "C_PAY_TYPE" character varying(10),
    "C_BANK_ACNO" character varying(20),
    "C_DED_MEALS" integer DEFAULT 0,
    "C_FYEAR" integer DEFAULT 0,
    "C_UNIT" character varying(40),
    "C_LATE_HOURS" integer DEFAULT 0,
    "C_FINAL_STATUS" integer DEFAULT 0,
    "C_DIVISION" character varying(40),
    "C_SECTION" character varying(40),
    "C_EMP_TYPE" character varying(20),
    "C_EMP_STATUS" character(1),
    "C_PF_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_ESI_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_OT_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_LIC_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_GEMPID" character varying(40),
    "BANKNAME" character varying(50),
    "BRANCHNAME" character varying(50),
    "IFSCCODE" character varying(50)
);


--
-- Name: EmpSalaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmpSalaries" (
    empid integer NOT NULL,
    basic integer,
    hra integer,
    conveyance integer,
    others1 integer,
    others2 integer,
    others3 integer,
    others4 integer,
    others5 integer,
    others6 integer,
    others7 integer,
    others8 integer,
    others9 integer,
    deduct_others1 integer,
    deduct_others2 integer,
    deduct_others3 integer,
    deduct_others4 integer,
    "IS_esi" character(1),
    "IS_pf" character(1),
    "IS_lic" character(1),
    "IS_ot" character(1),
    tds_amount integer,
    lic_amount integer,
    pay_mode character varying(10),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    username character varying(255),
    password_hash text,
    empid integer,
    ename character varying(255),
    role character varying(255),
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    failed_attempts integer DEFAULT 0,
    password_changed_at timestamp with time zone,
    created_by integer,
    created_date date,
    updated_at timestamp with time zone,
    permissions jsonb DEFAULT '[]'::jsonb,
    previous_login timestamp with time zone
);


--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


--
-- Name: accounts_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: accounts_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_settings_id_seq OWNED BY public.accounts_settings.id;


--
-- Name: advance_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advance_permission (
    advance_id bigint NOT NULL,
    advance_date timestamp with time zone,
    empid bigint,
    ename character varying(100),
    unit character varying(50),
    division character varying(50),
    designation character varying(50),
    advance_type character varying(50),
    advance_amount numeric(10,2),
    reason text,
    no_of_installments integer,
    monthly_installment numeric(10,2),
    created_by character varying(50),
    created_date date,
    status character varying(20),
    gross_salary numeric(10,2),
    deduct_from_month integer,
    deduct_from_year integer,
    deduction_schedule text
);


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id integer NOT NULL,
    financial_year_id integer NOT NULL,
    account_id integer NOT NULL,
    jan numeric(16,2) DEFAULT 0,
    feb numeric(16,2) DEFAULT 0,
    mar numeric(16,2) DEFAULT 0,
    apr numeric(16,2) DEFAULT 0,
    may numeric(16,2) DEFAULT 0,
    jun numeric(16,2) DEFAULT 0,
    jul numeric(16,2) DEFAULT 0,
    aug numeric(16,2) DEFAULT 0,
    sep numeric(16,2) DEFAULT 0,
    oct numeric(16,2) DEFAULT 0,
    nov numeric(16,2) DEFAULT 0,
    "dec" numeric(16,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chart_of_accounts (
    id integer NOT NULL,
    account_code character varying(20) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_type public.enum_chart_of_accounts_account_type NOT NULL,
    parent_id integer,
    is_group boolean DEFAULT false,
    is_active boolean DEFAULT true,
    opening_balance numeric(16,2) DEFAULT 0,
    opening_balance_type public.enum_chart_of_accounts_opening_balance_type,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chart_of_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chart_of_accounts_id_seq OWNED BY public.chart_of_accounts.id;


--
-- Name: emp_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emp_attendance (
    id integer NOT NULL,
    empid integer NOT NULL,
    att_date date,
    shift character varying(10),
    shift_start time without time zone,
    shift_end time without time zone,
    in_time time without time zone,
    out_time time without time zone,
    lunch_out time without time zone,
    lunch_in time without time zone,
    late_hrs numeric(5,2),
    ot_hrs numeric(5,2),
    status character varying(20),
    leave_type character varying(20),
    lop_days numeric(5,2),
    woff_day numeric(5,2),
    holiday boolean,
    remarks character varying(1000),
    created_date date,
    late_mins numeric(5,2),
    ot_mins numeric(5,2),
    out_status character varying(10),
    att_flag integer,
    unit character varying(40),
    division character varying(40),
    department character varying(40),
    app_ot character varying(10),
    app_status character varying(20) DEFAULT '0'::character varying,
    app_remarks character varying(150),
    hr_app_ot character varying(10),
    hr_app_status character varying(20) DEFAULT '0'::character varying,
    hr_remarks character varying(150),
    final_status character varying(20) DEFAULT '0'::character varying,
    last_upd_id integer,
    last_upd_dt timestamp with time zone,
    gempid character varying(40),
    tour_days numeric(5,2),
    late_exempt boolean
);


--
-- Name: emp_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emp_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emp_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emp_attendance_id_seq OWNED BY public.emp_attendance.id;


--
-- Name: emp_ext_ot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emp_ext_ot (
    id integer NOT NULL,
    empid integer NOT NULL,
    ename character varying(100),
    ot_date date NOT NULL,
    in_time time without time zone,
    out_time time without time zone,
    ot_hrs numeric(5,2),
    ot_type character varying(20) NOT NULL,
    app_status character varying(20),
    emp_remarks character varying(200),
    manager_remarks character varying(200),
    hr_remarks character varying(200),
    created_by integer,
    created_dt timestamp with time zone,
    manager_approved_by integer,
    manager_approved_dt timestamp with time zone,
    hr_approved_by integer,
    hr_approved_dt timestamp with time zone
);


--
-- Name: emp_ext_ot_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emp_ext_ot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emp_ext_ot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emp_ext_ot_id_seq OWNED BY public.emp_ext_ot.id;


--
-- Name: emp_family_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emp_family_master (
    id integer NOT NULL,
    empid integer NOT NULL,
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_sno integer,
    c_gempid character varying(40),
    fname character varying(40),
    fage character varying(20),
    frel character varying(30),
    foccp character varying(30)
);


--
-- Name: emp_family_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emp_family_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emp_family_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emp_family_master_id_seq OWNED BY public.emp_family_master.id;


--
-- Name: emp_payslip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emp_payslip (
    "C_MONTH" character varying(10) NOT NULL,
    "C_YEAR" integer NOT NULL,
    "C_EMPID" integer NOT NULL,
    "C_ENAME" character varying(100),
    "C_DESIG" character varying(70),
    "C_DEPT" character varying(40),
    "C_TOT_DAYS" numeric(5,2),
    "C_DAYS_PRESENT" numeric(5,2),
    "C_LEAVES_ALLOWED" numeric(5,2),
    "C_WOFF_HOL" numeric(5,2),
    "C_ABSENT_DAYS" numeric(5,2),
    "C_LATE_COMING" numeric(5,2),
    "C_PF_NUM" character varying(50),
    "C_ESI_NUM" character varying(50),
    "C_BASIC" numeric(10,2),
    "C_HRA" numeric(10,2),
    "C_CONV" numeric(10,2),
    "C_OTHERS" numeric(10,2),
    "C_TOT_SAL" numeric(10,2),
    "C_EARNED_BASIC" numeric(10,2),
    "C_EARNED_HRA" numeric(10,2),
    "C_EARNED_CONV" numeric(10,2),
    "C_EARNED_OTHERS" numeric(10,2),
    "C_EARNED_AB" numeric(10,2),
    "C_EARNED_OT" numeric(10,2),
    "C_EARNED_LUNCH" numeric(10,2),
    "C_EARNED_GROSS" numeric(10,2),
    "C_DED_PF" numeric(10,2),
    "C_DED_ESI" numeric(10,2),
    "C_DED_PT" numeric(10,2),
    "C_DED_LIC" numeric(10,2),
    "C_DED_TAX" numeric(10,2),
    "C_DED_ADV" numeric(10,2),
    "C_DED_OTH" numeric(10,2),
    "C_TOT_DED" numeric(10,2),
    "C_NET_AMT" numeric(10,2),
    "C_PAY_TYPE" character varying(10),
    "C_BANK_ACNO" character varying(20),
    "C_DED_MEALS" integer DEFAULT 0,
    "C_FYEAR" integer DEFAULT 0,
    "C_UNIT" character varying(40),
    "C_LATE_HOURS" integer DEFAULT 0,
    "C_FINAL_STATUS" integer DEFAULT 0,
    "C_DIVISION" character varying(40),
    "C_SECTION" character varying(40),
    "C_EMP_TYPE" character varying(20),
    "C_EMP_STATUS" character(1),
    "C_PF_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_ESI_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_OT_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_LIC_EXIST" character(1) DEFAULT 'N'::bpchar,
    "C_GEMPID" character varying(40),
    "BANKNAME" character varying(50),
    "BRANCHNAME" character varying(50),
    "IFSCCODE" character varying(50),
    "C_EARNED_BONUS" numeric(10,2) DEFAULT 0,
    "C_LATE_TIMES" integer DEFAULT 0,
    "C_LATE_HALF_DAYS" integer DEFAULT 0,
    "C_LATE_HALF_HOURS" integer DEFAULT 0,
    "C_LATE_DED_AMT" numeric(10,2) DEFAULT 0,
    "C_OT_HRS" numeric(5,2),
    "C_LOP_AMT" numeric(10,2)
);


--
-- Name: emp_qualification_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emp_qualification_master (
    id integer NOT NULL,
    empid integer NOT NULL,
    course character varying(150),
    noi character varying(150),
    per character varying(30),
    year character varying(30),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_sno integer,
    c_gempid character varying(40)
);


--
-- Name: emp_qualification_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emp_qualification_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emp_qualification_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emp_qualification_master_id_seq OWNED BY public.emp_qualification_master.id;


--
-- Name: employee_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_master (
    id uuid,
    empid integer NOT NULL,
    unit_id integer DEFAULT 1 NOT NULL,
    div_id integer,
    dept_id integer,
    sec_id integer,
    designation_id integer,
    reporting_manager_id integer,
    uname character varying(100),
    divname character varying(100),
    deptname character varying(100),
    secname character varying(100),
    gender character varying(10),
    marital_status character varying(20),
    ename character varying(100),
    fname character varying(100),
    dob timestamp with time zone,
    pob character varying(50),
    bgroup character varying(10),
    mother_tongue character varying(50),
    idfm1 character varying(100),
    idfm2 character varying(100),
    lang_known character varying(100),
    cadd_sa character varying(150),
    cadd_city character varying(50),
    cadd_state character varying(50),
    cadd_phone character varying(50),
    cadd_mobile character varying(50),
    cadd_pin character varying(50),
    cadd_email character varying(100),
    padd_sa character varying(150),
    padd_city character varying(50),
    padd_state character varying(50),
    padd_phone character varying(50),
    padd_mobile character varying(50),
    padd_pin character varying(50),
    padd_email character varying(100),
    employment_status character varying(20) DEFAULT 'Active'::character varying,
    resignation_date timestamp with time zone,
    termination_date timestamp with time zone,
    employee_profile text,
    applications text,
    summary character varying(4000),
    photo_blob bytea,
    img_name character varying(512),
    img_mimetype character varying(50),
    img_charset character varying(50),
    img_lastupd timestamp with time zone,
    is_active boolean DEFAULT true,
    is_approved boolean DEFAULT false,
    created_by character varying(50),
    updated_by character varying(50),
    created timestamp with time zone,
    updated timestamp with time zone,
    deleted_at timestamp with time zone,
    status character varying(20) DEFAULT 'Active'::character varying,
    left_date timestamp with time zone,
    left_reason character varying(255),
    c_eff_date date,
    c_status character(1),
    c_gen_user bigint,
    c_gen_date timestamp with time zone
);


--
-- Name: employee_movement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_movement (
    movement_id numeric(10,0) NOT NULL,
    movement_date date,
    empid numeric(10,0),
    ename character varying(100),
    unit character varying(30),
    division character varying(30),
    designation character varying(100),
    shift character varying(3),
    perm_ftime date,
    perm_ttime date,
    no_of_hrs numeric(10,2),
    reason_perm character varying(150),
    mov_dt date DEFAULT CURRENT_DATE,
    c_final_status numeric DEFAULT 0 NOT NULL,
    c_gempd character varying(40)
);


--
-- Name: esi_leave_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.esi_leave_permission (
    esi_leave_id bigint NOT NULL,
    esi_leave_date timestamp with time zone,
    empid bigint,
    ename character varying(100),
    unit character varying(50),
    division character varying(50),
    designation character varying(50),
    esi_no character varying(50),
    esi_dispencery character varying(100),
    hospital_name character varying(100),
    leave_from_date timestamp with time zone,
    leave_to_date timestamp with time zone,
    no_of_days integer,
    reason text,
    created_by character varying(50),
    created_date date,
    status character varying(20)
);


--
-- Name: financial_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_years (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false,
    is_closed boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: financial_years_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financial_years_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financial_years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financial_years_id_seq OWNED BY public.financial_years.id;


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    hno bigint NOT NULL,
    hdate date NOT NULL,
    hdesc character varying(100),
    hday character varying(30),
    yr integer NOT NULL,
    hremarks character varying(200),
    c_gen_user bigint,
    c_gen_date timestamp with time zone
);


--
-- Name: holidays_hno_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.holidays_hno_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: holidays_hno_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.holidays_hno_seq OWNED BY public.holidays.hno;


--
-- Name: leave_application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_application (
    lno bigint NOT NULL,
    ldate timestamp with time zone,
    empid bigint NOT NULL,
    ename character varying(100),
    designation character varying(50),
    department character varying(50),
    pofl character varying(100),
    address character varying(100),
    phno bigint,
    c_unit character varying(40),
    c_gempid character varying(40) NOT NULL,
    status character varying(20),
    remarks character varying(255)
);


--
-- Name: leave_approval; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_approval (
    id integer NOT NULL,
    lno bigint NOT NULL,
    empid bigint NOT NULL,
    frmdt timestamp with time zone,
    todate timestamp with time zone,
    nod numeric(10,2),
    daydt character varying(10),
    remarks character varying(150),
    cl_sanction numeric(10,2) DEFAULT 0,
    el_sanction numeric(10,2) DEFAULT 0,
    app_status character varying(20),
    app_remarks character varying(150),
    cancel_status character varying(1) DEFAULT ''::character varying,
    unit character varying(40),
    final_status character varying(20) DEFAULT '0'::character varying NOT NULL,
    gempid character varying(40),
    app_userid bigint,
    app_date timestamp with time zone,
    leave_type character varying(10)
);


--
-- Name: leave_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_approval_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_approval_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_approval_id_seq OWNED BY public.leave_approval.id;


--
-- Name: leave_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_details (
    id integer NOT NULL,
    lno bigint,
    empno bigint,
    frmdt timestamp with time zone,
    todate timestamp with time zone,
    nod numeric(10,2),
    remarks character varying(150),
    daydt character varying(10) NOT NULL,
    c_hr_app_status character varying(20),
    c_hr_app_remarks character varying(150),
    c_cl_sanction numeric(10,2) DEFAULT 0,
    c_el_sanction numeric(10,2) DEFAULT 0,
    c_unit character varying(40),
    c_gempid character varying(40)
);


--
-- Name: leave_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_details_id_seq OWNED BY public.leave_details.id;


--
-- Name: leave_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_master (
    empid bigint NOT NULL,
    empname character varying(100),
    unit character varying(40),
    division character varying(40),
    department character varying(40),
    section character varying(40),
    cls_utilised numeric(10,2),
    cls_balance numeric(10,2),
    els_utilised numeric(10,2),
    els_balance numeric(10,2),
    remarks character varying(150),
    yr timestamp with time zone,
    cls_jan_status integer,
    cls_feb_status integer,
    cls_mar_status integer,
    cls_apr_status integer,
    cls_may_status integer,
    cls_jun_status integer,
    cls_jul_status integer,
    cls_aug_status integer,
    cls_sep_status integer,
    cls_oct_status integer,
    cls_nov_status integer,
    cls_dec_status integer,
    cls_last_update timestamp with time zone,
    final_status character varying(20) DEFAULT '0'::character varying NOT NULL,
    gempid character varying(40)
);


--
-- Name: leave_position; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_position (
    lno bigint NOT NULL,
    ldate timestamp with time zone NOT NULL,
    empid bigint NOT NULL,
    leaves_applied numeric(10,2) NOT NULL,
    cls_eligible numeric(10,2) DEFAULT 0 NOT NULL,
    cls_utilized numeric(10,2) DEFAULT 0 NOT NULL,
    cls_balance numeric(10,2) DEFAULT 0 NOT NULL,
    els_eligible numeric(10,2) DEFAULT 0 NOT NULL,
    els_utilized numeric(10,2) DEFAULT 0 NOT NULL,
    els_balance numeric(10,2) DEFAULT 0 NOT NULL,
    previous_lop_days numeric(10,2) DEFAULT 0 NOT NULL,
    present_lop_days numeric(10,2) DEFAULT 0 NOT NULL,
    tot_lop_days numeric(10,2) DEFAULT 0 NOT NULL,
    last_lno bigint,
    last_ldate timestamp with time zone,
    unit character varying(40),
    remarks character varying(100),
    app_date timestamp with time zone,
    app_user bigint,
    approved_cls numeric(10,2),
    approved_els bigint,
    app_cls_utilised numeric(10,2),
    app_cls_balance numeric(10,2),
    app_els_utilised bigint,
    app_els_balance bigint,
    gempid character varying(40)
);


--
-- Name: leave_position_lno_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_position_lno_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_position_lno_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_position_lno_seq OWNED BY public.leave_position.lno;


--
-- Name: m_company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_company_settings (
    id integer NOT NULL,
    company_name character varying(255) DEFAULT ''::character varying NOT NULL,
    address text,
    phone character varying(255),
    email character varying(255),
    website character varying(255),
    gstin character varying(255),
    pf_number character varying(255),
    esi_number character varying(255),
    payroll_pt_rate numeric(10,2) DEFAULT 200,
    payroll_ot_multiplier numeric(10,2) DEFAULT 1.5,
    c_last_update timestamp with time zone,
    logo_url text
);


--
-- Name: m_company_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_company_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_company_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_company_settings_id_seq OWNED BY public.m_company_settings.id;


--
-- Name: m_cost_center; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_cost_center (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_cost_center_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_cost_center_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_cost_center_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_cost_center_id_seq OWNED BY public.m_cost_center.id;


--
-- Name: m_customer_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_customer_master (
    id integer NOT NULL,
    customer_code character varying(50) NOT NULL,
    customer_name character varying(255) NOT NULL,
    contact_person character varying(100),
    email character varying(100),
    phone character varying(20),
    mobile character varying(20),
    gstin character varying(20),
    pan character varying(20),
    billing_address text,
    shipping_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    credit_limit numeric(14,2) DEFAULT 0,
    credit_days integer DEFAULT 0,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_customer_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_customer_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_customer_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_customer_master_id_seq OWNED BY public.m_customer_master.id;


--
-- Name: m_emp_experience; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_experience (
    id integer NOT NULL,
    empid integer NOT NULL,
    name character varying(100),
    address character varying(100),
    ffrom timestamp with time zone,
    tto timestamp with time zone,
    duration character varying(10),
    onj character varying(10),
    onl character varying(10),
    salary integer,
    nod character varying(10),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_sno integer,
    c_gempid character varying(40)
);


--
-- Name: m_emp_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_emp_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_emp_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_emp_experience_id_seq OWNED BY public.m_emp_experience.id;


--
-- Name: m_emp_family; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_family (
    id integer NOT NULL,
    empid integer NOT NULL,
    fname character varying(40),
    fage character varying(20),
    frel character varying(30),
    foccp character varying(30),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_sno integer,
    c_gempid character varying(40)
);


--
-- Name: m_emp_family_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_emp_family_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_emp_family_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_emp_family_id_seq OWNED BY public.m_emp_family.id;


--
-- Name: m_emp_off_det; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_off_det (
    empid integer NOT NULL,
    doi timestamp with time zone,
    doj timestamp with time zone,
    jas character varying(50),
    pp character varying(10),
    tp character varying(10),
    rto character varying(40),
    rto_dept character varying(40),
    designation character varying(50),
    emp_status character(1),
    pfacno character varying(50),
    esiacno character varying(50),
    bankacno character varying(20),
    passport_no character varying(50),
    validity integer,
    panno character varying(50),
    oc character(1),
    bond_exec character(1),
    bond_yrs integer,
    bond_frmdt timestamp with time zone,
    bond_todt timestamp with time zone,
    doinc timestamp with time zone,
    inc_note character varying(150),
    special_note character varying(150),
    c_weekly_off character varying(10),
    c_high_qual character varying(50),
    c_aadhar_no bigint,
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_default_shift character varying(10),
    c_doj_inc_date timestamp with time zone,
    c_shift_disable integer,
    c_gempid character varying(40),
    c_uan_no bigint,
    bankname character varying(50),
    branchname character varying(50),
    ifsccode character varying(50)
);


--
-- Name: m_emp_qualification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_qualification (
    id integer NOT NULL,
    empid integer NOT NULL,
    course character varying(150),
    noi character varying(150),
    per character varying(30),
    year character varying(30),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    c_sno integer,
    c_gempid character varying(40)
);


--
-- Name: m_emp_qualification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_emp_qualification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_emp_qualification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_emp_qualification_id_seq OWNED BY public.m_emp_qualification.id;


--
-- Name: m_emp_sal_det; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_sal_det (
    empid integer NOT NULL,
    basic integer,
    hra integer,
    conveyance integer,
    others1 integer,
    others2 integer,
    others3 integer,
    others4 integer,
    others5 integer,
    others6 integer,
    others7 integer,
    others8 integer,
    others9 integer,
    deduct_others1 integer,
    deduct_others2 integer,
    deduct_others3 integer,
    deduct_others4 integer,
    i_s_esi character(1),
    i_s_pf character(1),
    i_s_lic character(1),
    i_s_ot character(1),
    tds_amount integer,
    lic_amount integer,
    pay_mode character varying(10),
    c_last_update timestamp with time zone,
    c_upd_userid integer
);


--
-- Name: m_emp_salary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_emp_salary (
    empid integer NOT NULL,
    basic integer,
    hra integer,
    conveyance integer,
    others1 integer,
    others2 integer,
    others3 integer,
    others4 integer,
    others5 integer,
    others6 integer,
    others7 integer,
    others8 integer,
    others9 integer,
    deduct_others1 integer,
    deduct_others2 integer,
    deduct_others3 integer,
    deduct_others4 integer,
    i_s_esi character(1),
    i_s_pf character(1),
    i_s_lic character(1),
    i_s_ot character(1),
    tds_amount integer,
    lic_amount integer,
    pay_mode character varying(10),
    c_last_update timestamp with time zone,
    c_upd_userid integer,
    washing_allowance integer
);


--
-- Name: m_engineering_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_engineering_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_engineering_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_engineering_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_engineering_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_engineering_settings_id_seq OWNED BY public.m_engineering_settings.id;


--
-- Name: m_grn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_grn (
    id integer NOT NULL,
    grn_no character varying(50) NOT NULL,
    grn_date date NOT NULL,
    po_id integer NOT NULL,
    supplier_id integer NOT NULL,
    invoice_no character varying(50),
    invoice_date date,
    gate_entry_no character varying(50),
    status character varying(30) DEFAULT 'Received'::character varying,
    received_by character varying(100),
    notes text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_grn_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_grn_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_grn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_grn_id_seq OWNED BY public.m_grn.id;


--
-- Name: m_grn_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_grn_item (
    id integer NOT NULL,
    grn_id integer NOT NULL,
    po_item_id integer,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    ordered_qty numeric(12,2) DEFAULT 0,
    received_qty numeric(12,2) DEFAULT 0,
    accepted_qty numeric(12,2) DEFAULT 0,
    rejected_qty numeric(12,2) DEFAULT 0,
    reject_reason text,
    rate numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0
);


--
-- Name: m_grn_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_grn_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_grn_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_grn_item_id_seq OWNED BY public.m_grn_item.id;


--
-- Name: m_item_batch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_batch (
    id integer NOT NULL,
    batch_no character varying(50) NOT NULL,
    item_id integer,
    quantity numeric(12,2) DEFAULT 0,
    mfg_date date,
    exp_date date,
    is_active boolean DEFAULT true,
    created_date date DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: m_item_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_batch_id_seq OWNED BY public.m_item_batch.id;


--
-- Name: m_item_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_group (
    id integer NOT NULL,
    code character varying(20),
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


--
-- Name: m_item_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_group_id_seq OWNED BY public.m_item_group.id;


--
-- Name: m_item_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_master (
    id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    item_name character varying(255) NOT NULL,
    item_description text,
    group_id integer,
    subgroup_id integer,
    type_id integer,
    subtype_id integer,
    unit_id integer,
    hsn_code character varying(20),
    gst_rate numeric(5,2) DEFAULT 0,
    brand character varying(100),
    opening_stock numeric(12,2) DEFAULT 0,
    current_stock numeric(12,2) DEFAULT 0,
    min_stock numeric(12,2) DEFAULT 0,
    max_stock numeric(12,2) DEFAULT 0,
    reorder_level numeric(12,2) DEFAULT 0,
    min_order_qty numeric(12,2) DEFAULT 0,
    reorder_qty numeric(12,2) DEFAULT 0,
    lead_time_days integer,
    default_location character varying(100),
    abc_class character varying(1),
    valuation_method character varying(20) DEFAULT 'Moving Average'::character varying,
    standard_cost numeric(14,2) DEFAULT 0,
    last_purchase_cost numeric(14,2) DEFAULT 0,
    moving_average_cost numeric(14,2) DEFAULT 0,
    mrp numeric(14,2) DEFAULT 0,
    track_serial boolean DEFAULT false,
    track_batch boolean DEFAULT false,
    barcode character varying(50),
    barcode_type character varying(20),
    attributes json,
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone,
    created_by character varying(100),
    updated_by character varying(100),
    approved_by character varying(100),
    approved_date timestamp without time zone,
    authorized_by character varying(100),
    authorized_date timestamp without time zone
);


--
-- Name: m_item_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_master_id_seq OWNED BY public.m_item_master.id;


--
-- Name: m_item_subgroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_subgroup (
    id integer NOT NULL,
    group_id integer NOT NULL,
    code character varying(20),
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


--
-- Name: m_item_subgroup_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_subgroup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_subgroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_subgroup_id_seq OWNED BY public.m_item_subgroup.id;


--
-- Name: m_item_subtype; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_subtype (
    id integer NOT NULL,
    type_id integer NOT NULL,
    code character varying(20),
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


--
-- Name: m_item_subtype_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_subtype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_subtype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_subtype_id_seq OWNED BY public.m_item_subtype.id;


--
-- Name: m_item_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_item_type (
    id integer NOT NULL,
    subgroup_id integer NOT NULL,
    code character varying(20),
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


--
-- Name: m_item_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_item_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_item_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_item_type_id_seq OWNED BY public.m_item_type.id;


--
-- Name: m_maintenance_asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_maintenance_asset (
    id integer NOT NULL,
    asset_code character varying(50) NOT NULL,
    asset_name character varying(200) NOT NULL,
    asset_type character varying(100),
    department character varying(100),
    location character varying(200),
    purchase_date date,
    purchase_cost numeric(14,2),
    warranty_expiry date,
    status public.enum_m_maintenance_asset_status DEFAULT 'Active'::public.enum_m_maintenance_asset_status,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: m_maintenance_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_maintenance_asset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_maintenance_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_maintenance_asset_id_seq OWNED BY public.m_maintenance_asset.id;


--
-- Name: m_maintenance_machine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_maintenance_machine (
    id integer NOT NULL,
    machine_code character varying(50) NOT NULL,
    machine_name character varying(200) NOT NULL,
    machine_type character varying(100),
    department character varying(100),
    location character varying(200),
    manufacturer character varying(200),
    model_no character varying(100),
    serial_no character varying(100),
    installation_date date,
    status public.enum_m_maintenance_machine_status DEFAULT 'Active'::public.enum_m_maintenance_machine_status,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: m_maintenance_machine_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_maintenance_machine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_maintenance_machine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_maintenance_machine_id_seq OWNED BY public.m_maintenance_machine.id;


--
-- Name: m_maintenance_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_maintenance_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    category character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: m_maintenance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_maintenance_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_maintenance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_maintenance_settings_id_seq OWNED BY public.m_maintenance_settings.id;


--
-- Name: m_marketing_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_marketing_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_marketing_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_marketing_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_marketing_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_marketing_settings_id_seq OWNED BY public.m_marketing_settings.id;


--
-- Name: m_party_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_party_master (
    id integer NOT NULL,
    party_type character varying(20) DEFAULT 'Supplier'::character varying,
    supplier_code character varying(50) NOT NULL,
    supplier_name character varying(200) NOT NULL,
    contact_person character varying(100),
    email character varying(100),
    phone character varying(20),
    mobile character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    gstin character varying(15),
    pan_no character varying(10),
    payment_terms character varying(50),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone,
    gst_registration_type character varying(20),
    msme_reg_no character varying(50),
    msme_type character varying(20)
);


--
-- Name: m_party_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_party_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_party_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_party_master_id_seq OWNED BY public.m_party_master.id;


--
-- Name: m_planning_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_planning_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    category character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: m_planning_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_planning_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_planning_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_planning_settings_id_seq OWNED BY public.m_planning_settings.id;


--
-- Name: m_product_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_product_category (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(10) DEFAULT 'Sub'::character varying NOT NULL,
    parent_id integer,
    description character varying(200),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_product_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_product_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_product_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_product_category_id_seq OWNED BY public.m_product_category.id;


--
-- Name: m_product_item_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_product_item_master (
    id integer NOT NULL,
    product_id integer NOT NULL,
    item_id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    item_name character varying(200) NOT NULL,
    quantity numeric(12,3) DEFAULT 1 NOT NULL,
    unit_id integer,
    wastage_percent numeric(5,2) DEFAULT 0,
    created_date date
);


--
-- Name: m_product_item_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_product_item_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_product_item_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_product_item_master_id_seq OWNED BY public.m_product_item_master.id;


--
-- Name: m_product_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_product_master (
    id integer NOT NULL,
    product_uid character varying(10) NOT NULL,
    product_type character varying(50),
    product_code character varying(50),
    part_name character varying(50),
    description character varying(500),
    finish_type character varying(20),
    assembly_qty numeric(20,3) DEFAULT 0 NOT NULL,
    qty_per_pallet numeric(12,3),
    created_by integer,
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone,
    item_id integer,
    node_type character varying(20) DEFAULT 'SKU'::character varying NOT NULL,
    parent_id integer,
    color character varying(50),
    category_id integer
);


--
-- Name: m_product_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_product_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_product_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_product_master_id_seq OWNED BY public.m_product_master.id;


--
-- Name: m_production_machine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_production_machine (
    id integer NOT NULL,
    machine_code character varying(50) NOT NULL,
    machine_name character varying(200) NOT NULL,
    machine_type character varying(100),
    department character varying(100),
    location character varying(200),
    manufacturer character varying(200),
    model_no character varying(100),
    serial_no character varying(100),
    installation_date date,
    capacity_per_hour numeric(12,2),
    power_rating character varying(50),
    status public.enum_m_production_machine_status DEFAULT 'Active'::public.enum_m_production_machine_status,
    last_maintenance_date date,
    next_maintenance_date date,
    notes text,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_production_machine_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_production_machine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_production_machine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_production_machine_id_seq OWNED BY public.m_production_machine.id;


--
-- Name: m_production_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_production_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_production_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_production_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_production_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_production_settings_id_seq OWNED BY public.m_production_settings.id;


--
-- Name: m_purchase_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_purchase_order (
    id integer NOT NULL,
    po_no character varying(50) NOT NULL,
    po_date date NOT NULL,
    supplier_id integer NOT NULL,
    requisition_id integer,
    status character varying(30) DEFAULT 'Draft'::character varying,
    payment_terms character varying(100),
    delivery_terms text,
    subtotal numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(14,2) DEFAULT 0,
    tax_amount numeric(14,2) DEFAULT 0,
    grand_total numeric(14,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'INR'::character varying,
    notes text,
    approved_by character varying(100),
    approved_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_purchase_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_purchase_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_purchase_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_purchase_order_id_seq OWNED BY public.m_purchase_order.id;


--
-- Name: m_purchase_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_purchase_order_item (
    id integer NOT NULL,
    po_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    received_quantity numeric(12,2) DEFAULT 0,
    unit_id integer,
    rate numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0,
    gst_rate numeric(5,2) DEFAULT 0,
    gst_amount numeric(14,2) DEFAULT 0,
    total numeric(14,2) DEFAULT 0,
    delivery_date date
);


--
-- Name: m_purchase_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_purchase_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_purchase_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_purchase_order_item_id_seq OWNED BY public.m_purchase_order_item.id;


--
-- Name: m_purchase_requisition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_purchase_requisition (
    id integer NOT NULL,
    req_no character varying(50) NOT NULL,
    req_date date NOT NULL,
    department character varying(100),
    requested_by character varying(100),
    indent_type character varying(50),
    status character varying(30) DEFAULT 'Pending'::character varying,
    priority character varying(20) DEFAULT 'Normal'::character varying,
    notes text,
    approved_by character varying(100),
    approved_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_purchase_requisition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_purchase_requisition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_purchase_requisition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_purchase_requisition_id_seq OWNED BY public.m_purchase_requisition.id;


--
-- Name: m_purchase_requisition_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_purchase_requisition_item (
    id integer NOT NULL,
    requisition_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    expected_date date,
    remarks text
);


--
-- Name: m_purchase_requisition_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_purchase_requisition_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_purchase_requisition_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_purchase_requisition_item_id_seq OWNED BY public.m_purchase_requisition_item.id;


--
-- Name: m_purchase_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_purchase_settings (
    id integer DEFAULT 1 NOT NULL,
    pr_prefix character varying(10) DEFAULT 'PR'::character varying,
    po_prefix character varying(10) DEFAULT 'PO'::character varying,
    rfq_prefix character varying(10) DEFAULT 'RFQ'::character varying,
    grn_prefix character varying(10) DEFAULT 'GRN'::character varying,
    fin_year_format character varying(20) DEFAULT 'FY-{YYYY}-{YY}'::character varying,
    default_payment_terms character varying(100) DEFAULT '30 Days'::character varying,
    default_delivery_terms text DEFAULT 'Ex Works'::text,
    default_currency character varying(10) DEFAULT 'INR'::character varying,
    default_gst_rate numeric(5,2) DEFAULT 18,
    req_approval_required boolean DEFAULT true,
    po_approval_required boolean DEFAULT true,
    req_approval_limit numeric(14,2) DEFAULT 0,
    po_approval_limit numeric(14,2) DEFAULT 0,
    auto_generate_pr boolean DEFAULT false,
    auto_generate_po boolean DEFAULT false,
    created_date date,
    updated_at timestamp with time zone,
    auto_generate_rfq boolean DEFAULT false,
    auto_generate_grn boolean DEFAULT false,
    CONSTRAINT m_purchase_settings_id_check CHECK ((id = 1))
);


--
-- Name: m_quality_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_quality_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: m_quality_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_quality_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_quality_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_quality_settings_id_seq OWNED BY public.m_quality_settings.id;


--
-- Name: m_rack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_rack (
    id integer NOT NULL,
    rack_code character varying(30) NOT NULL,
    rack_name character varying(100),
    location character varying(200),
    is_active boolean DEFAULT true,
    created_date date DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: m_rack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_rack_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_rack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_rack_id_seq OWNED BY public.m_rack.id;


--
-- Name: m_rfq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_rfq (
    id integer NOT NULL,
    rfq_no character varying(50) NOT NULL,
    rfq_date date NOT NULL,
    subject character varying(300),
    status character varying(30) DEFAULT 'Open'::character varying,
    closing_date date,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_rfq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_rfq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_rfq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_rfq_id_seq OWNED BY public.m_rfq.id;


--
-- Name: m_rfq_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_rfq_item (
    id integer NOT NULL,
    rfq_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer
);


--
-- Name: m_rfq_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_rfq_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_rfq_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_rfq_item_id_seq OWNED BY public.m_rfq_item.id;


--
-- Name: m_rfq_vendor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_rfq_vendor (
    id integer NOT NULL,
    rfq_id integer NOT NULL,
    supplier_id integer NOT NULL,
    quoted_amount numeric(14,2),
    delivery_days integer,
    validity_days integer,
    remarks text,
    is_selected boolean DEFAULT false
);


--
-- Name: m_rfq_vendor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_rfq_vendor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_rfq_vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_rfq_vendor_id_seq OWNED BY public.m_rfq_vendor.id;


--
-- Name: m_stores_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_stores_settings (
    id integer DEFAULT 1 NOT NULL,
    mr_prefix character varying(10) DEFAULT 'MR'::character varying,
    mi_prefix character varying(10) DEFAULT 'MI'::character varying,
    default_warehouse character varying(100) DEFAULT 'Main Store'::character varying,
    valuation_method character varying(20) DEFAULT 'FIFO'::character varying,
    bin_location_required boolean DEFAULT true,
    batch_tracking_enabled boolean DEFAULT false,
    auto_generate_mr boolean DEFAULT false,
    auto_generate_mi boolean DEFAULT false,
    negative_stock_allowed boolean DEFAULT false,
    low_stock_alert boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone,
    grn_prefix character varying(10) DEFAULT 'GRR'::character varying NOT NULL,
    auto_generate_grn boolean DEFAULT false NOT NULL
);


--
-- Name: m_subcontract_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_subcontract_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    category character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: m_subcontract_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_subcontract_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_subcontract_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_subcontract_settings_id_seq OWNED BY public.m_subcontract_settings.id;


--
-- Name: m_supplier_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_supplier_master (
    id integer NOT NULL,
    supplier_code character varying(50) NOT NULL,
    supplier_name character varying(200) NOT NULL,
    contact_person character varying(100),
    email character varying(100),
    phone character varying(20),
    mobile character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    gstin character varying(15),
    pan_no character varying(10),
    payment_terms character varying(50),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_supplier_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_supplier_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_supplier_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_supplier_master_id_seq OWNED BY public.m_supplier_master.id;


--
-- Name: m_unit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_unit (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    short_name character varying(10),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: m_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_unit_id_seq OWNED BY public.m_unit.id;


--
-- Name: m_vendor_price_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_vendor_price_list (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    item_id integer NOT NULL,
    rate numeric(14,2) NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying,
    effective_from date,
    effective_to date,
    moq numeric(12,2),
    lead_days integer,
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone,
    gst_rate numeric(5,2) DEFAULT 0
);


--
-- Name: m_vendor_price_list_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_vendor_price_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_vendor_price_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_vendor_price_list_id_seq OWNED BY public.m_vendor_price_list.id;


--
-- Name: m_vendor_rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_vendor_rating (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    po_id integer,
    quality_score numeric(5,2) DEFAULT 0,
    delivery_score numeric(5,2) DEFAULT 0,
    price_score numeric(5,2) DEFAULT 0,
    service_score numeric(5,2) DEFAULT 0,
    overall_score numeric(5,2) DEFAULT 0,
    remarks text,
    rated_by character varying(100),
    rating_date date
);


--
-- Name: m_vendor_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_vendor_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_vendor_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_vendor_rating_id_seq OWNED BY public.m_vendor_rating.id;


--
-- Name: muster_roll_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.muster_roll_summary (
    empid integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    present_days numeric(5,2),
    woff_days numeric(5,2),
    holiday_days numeric(5,2),
    cl_days numeric(5,2),
    el_days numeric(5,2),
    lop_days numeric(5,2),
    absent_days numeric(5,2),
    total_days numeric(5,2),
    ot_hours numeric(8,2),
    late_hours numeric(8,2),
    att_bonus character(1) DEFAULT 'N'::bpchar,
    updated_at timestamp with time zone
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    empid integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(255) DEFAULT 'General'::character varying NOT NULL,
    "isRead" boolean DEFAULT false,
    link character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: onduty_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onduty_permission (
    movement_id bigint NOT NULL,
    movement_date timestamp with time zone,
    empid bigint,
    ename character varying(100),
    unit character varying(50),
    division character varying(50),
    designation character varying(50),
    act_date timestamp with time zone,
    shift character varying(10),
    perm_ftime time without time zone,
    perm_ttime time without time zone,
    no_of_hrs numeric(5,2),
    reason_perm text,
    created_by character varying(50),
    created_date date,
    status character varying(20)
);


--
-- Name: profile_update_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_update_requests (
    id uuid NOT NULL,
    empid integer NOT NULL,
    request_type character varying(20) NOT NULL,
    old_comm_address character varying(500),
    new_comm_address character varying(500),
    old_comm_phone character varying(50),
    new_comm_phone character varying(50),
    old_comm_mobile character varying(50),
    new_comm_mobile character varying(50),
    old_perm_address character varying(500),
    new_perm_address character varying(500),
    old_perm_phone character varying(50),
    new_perm_phone character varying(50),
    old_perm_mobile character varying(50),
    new_perm_mobile character varying(50),
    status character varying(20) DEFAULT 'Pending'::character varying,
    hr_remarks character varying(500),
    reviewed_by integer,
    reviewed_at timestamp with time zone,
    created timestamp with time zone,
    updated timestamp with time zone
);


--
-- Name: salary_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salary_register (
    id integer NOT NULL,
    empid integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    working_days integer,
    present_days integer,
    absent_days integer,
    leave_days integer,
    od_days integer,
    basic numeric(10,2),
    hra numeric(10,2),
    conveyance numeric(10,2),
    others numeric(10,2),
    gross_salary numeric(10,2),
    pf numeric(10,2),
    esi numeric(10,2),
    tds numeric(10,2),
    lic numeric(10,2),
    other_deductions numeric(10,2),
    total_deductions numeric(10,2),
    net_salary numeric(10,2),
    overtime_hrs numeric(5,2),
    overtime_amount numeric(10,2),
    ot_rate numeric(10,2),
    created_date date,
    status character varying(20)
);


--
-- Name: salary_register_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salary_register_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salary_register_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salary_register_id_seq OWNED BY public.salary_register.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: shift_change; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_change (
    schange_no integer NOT NULL,
    schange_date timestamp with time zone,
    empid bigint,
    empname character varying(100),
    designation character varying(100),
    department character varying(50),
    act_shift character varying(2),
    act_sstart_time character varying(10),
    act_send_time character varying(10),
    change_shift character varying(2),
    cha_sstart_time character varying(10),
    cha_send_time character varying(10),
    purpose character varying(150),
    remarks character varying(150),
    schange_from timestamp with time zone,
    schange_to timestamp with time zone,
    app_status character varying(20) NOT NULL,
    cancel_status character varying(20),
    cancel_empid bigint,
    cancel_date timestamp with time zone,
    unit character varying(40),
    final_status character varying(20) DEFAULT '0'::character varying NOT NULL,
    gempid character varying(40)
);


--
-- Name: shift_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_master (
    shift_id bigint NOT NULL,
    shift_cd character varying(10),
    start_time character varying(10),
    end_time character varying(10),
    lunch_start_time character varying(10),
    lunch_end_time character varying(10),
    u1 character varying(3),
    u2 character varying(3),
    u3 character varying(3),
    u4 character varying(3),
    u5 character varying(3),
    u6 character varying(3),
    c_eff_date date,
    c_status character(1),
    c_shift_status character(1),
    c_gen_user bigint,
    c_gen_date timestamp with time zone
);


--
-- Name: shift_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_schedule (
    id integer NOT NULL,
    shift_date timestamp with time zone,
    gen_date timestamp with time zone,
    gen_user bigint,
    unit character varying(30),
    division character varying(30),
    empid bigint NOT NULL,
    shift_cd character varying(10) NOT NULL,
    machine_cd character varying(10),
    remarks character varying(100),
    shift_start_time timestamp with time zone,
    shift_end_time timestamp with time zone,
    shift_status character varying(10),
    final_status integer DEFAULT 0 NOT NULL,
    gempid character varying(40)
);


--
-- Name: shift_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shift_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shift_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shift_schedule_id_seq OWNED BY public.shift_schedule.id;


--
-- Name: t_appraisal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_appraisal (
    id integer NOT NULL,
    cycle_id integer NOT NULL,
    empid integer NOT NULL,
    template_id integer,
    self_final_score numeric(5,2),
    manager_final_score numeric(5,2),
    overall_rating numeric(3,1),
    status character varying(20) DEFAULT 'Pending'::character varying,
    reviewer character varying(100),
    review_date date,
    comments text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_appraisal_cycle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_appraisal_cycle (
    id integer NOT NULL,
    cycle_name character varying(200) NOT NULL,
    cycle_type character varying(30) DEFAULT 'Annual'::character varying,
    financial_year character varying(20),
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'Open'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_appraisal_cycle_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_appraisal_cycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_appraisal_cycle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_appraisal_cycle_id_seq OWNED BY public.t_appraisal_cycle.id;


--
-- Name: t_appraisal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_appraisal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_appraisal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_appraisal_id_seq OWNED BY public.t_appraisal.id;


--
-- Name: t_appraisal_rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_appraisal_rating (
    id integer NOT NULL,
    appraisal_id integer NOT NULL,
    template_item_id integer NOT NULL,
    self_score numeric(5,2),
    manager_score numeric(5,2),
    self_remarks text,
    manager_remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_appraisal_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_appraisal_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_appraisal_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_appraisal_rating_id_seq OWNED BY public.t_appraisal_rating.id;


--
-- Name: t_attendance_raw_punch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_attendance_raw_punch (
    id bigint NOT NULL,
    empid integer NOT NULL,
    punch_time timestamp with time zone NOT NULL,
    punch_date date,
    direction character varying(10) DEFAULT 'IN'::character varying,
    device_id character varying(50),
    device_name character varying(100),
    mode character varying(20) DEFAULT 'Fingerprint'::character varying,
    source character varying(30) DEFAULT 'CSV'::character varying,
    batch_id character varying(50),
    processed boolean DEFAULT false,
    created_date date
);


--
-- Name: t_attendance_raw_punch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_attendance_raw_punch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_attendance_raw_punch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_attendance_raw_punch_id_seq OWNED BY public.t_attendance_raw_punch.id;


--
-- Name: t_bom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_bom (
    id integer NOT NULL,
    bom_no character varying(50) NOT NULL,
    bom_name character varying(200) NOT NULL,
    product_item_id integer NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(200) NOT NULL,
    output_quantity numeric(12,2) DEFAULT 1,
    unit_id integer,
    status character varying(20) DEFAULT 'Active'::character varying,
    version character varying(20) DEFAULT '1.0'::character varying,
    remarks text,
    created_date date,
    updated_at timestamp with time zone,
    labour_cost numeric(14,2) DEFAULT 0 NOT NULL,
    overhead_cost numeric(14,2) DEFAULT 0 NOT NULL,
    overhead_is_percent boolean DEFAULT false NOT NULL,
    margin_percent numeric(5,2) DEFAULT 0 NOT NULL,
    selling_price numeric(14,2) DEFAULT 0 NOT NULL,
    product_id integer
);


--
-- Name: t_bom_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_bom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_bom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_bom_id_seq OWNED BY public.t_bom.id;


--
-- Name: t_bom_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_bom_item (
    id integer NOT NULL,
    bom_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,4) NOT NULL,
    unit_id integer,
    wastage_percent numeric(5,2) DEFAULT 0,
    remarks text,
    created_date date,
    parent_item_id integer,
    sub_bom_id integer,
    sort_order integer DEFAULT 0,
    section_name character varying(100),
    is_phantom boolean DEFAULT false,
    lot_quantity numeric(12,2) DEFAULT 1,
    color character varying(100),
    unit_cost numeric(14,2),
    operation character varying(100)
);


--
-- Name: t_bom_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_bom_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_bom_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_bom_item_id_seq OWNED BY public.t_bom_item.id;


--
-- Name: t_candidate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_candidate (
    id integer NOT NULL,
    requisition_id integer,
    name character varying(200) NOT NULL,
    email character varying(200),
    phone character varying(20),
    resume_url text,
    current_company character varying(200),
    experience_years numeric(4,1),
    qualification character varying(200),
    source character varying(50) DEFAULT 'Portal'::character varying,
    status character varying(20) DEFAULT 'New'::character varying,
    applied_date date,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_candidate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_candidate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_candidate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_candidate_id_seq OWNED BY public.t_candidate.id;


--
-- Name: t_certification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_certification (
    id integer NOT NULL,
    empid integer NOT NULL,
    certification_name character varying(300) NOT NULL,
    issued_by character varying(200),
    issued_date date,
    expiry_date date,
    credential_url text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_certification_id_seq OWNED BY public.t_certification.id;


--
-- Name: t_delivery_challan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_delivery_challan (
    id integer NOT NULL,
    dc_no character varying(30) NOT NULL,
    dc_date date NOT NULL,
    party_id integer,
    party_name character varying(200),
    returnable boolean DEFAULT false,
    expected_return_date date,
    reference_no character varying(50),
    vehicle_no character varying(30),
    driver_name character varying(100),
    remarks text,
    status character varying(20) DEFAULT 'Draft'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_delivery_challan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_delivery_challan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_delivery_challan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_delivery_challan_id_seq OWNED BY public.t_delivery_challan.id;


--
-- Name: t_delivery_challan_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_delivery_challan_item (
    id integer NOT NULL,
    dc_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    returned_qty numeric(12,2) DEFAULT 0,
    remarks text
);


--
-- Name: t_delivery_challan_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_delivery_challan_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_delivery_challan_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_delivery_challan_item_id_seq OWNED BY public.t_delivery_challan_item.id;


--
-- Name: t_disciplinary_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_disciplinary_action (
    id integer NOT NULL,
    case_id integer NOT NULL,
    action_type character varying(50),
    action_date date,
    description text,
    effective_from date,
    effective_to date,
    approved_by character varying(100),
    remarks text,
    created_date date
);


--
-- Name: t_disciplinary_action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_disciplinary_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_disciplinary_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_disciplinary_action_id_seq OWNED BY public.t_disciplinary_action.id;


--
-- Name: t_disciplinary_case; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_disciplinary_case (
    id integer NOT NULL,
    case_no character varying(30),
    empid integer NOT NULL,
    incident_date date,
    reported_date date,
    nature character varying(100),
    description text,
    severity character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(20) DEFAULT 'Open'::character varying,
    reported_by character varying(100),
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_disciplinary_case_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_disciplinary_case_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_disciplinary_case_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_disciplinary_case_id_seq OWNED BY public.t_disciplinary_case.id;


--
-- Name: t_emp_tax_computation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_emp_tax_computation (
    id integer NOT NULL,
    empid integer NOT NULL,
    financial_year character varying(20) NOT NULL,
    gross_income numeric(14,2) DEFAULT 0,
    standard_deduction numeric(14,2) DEFAULT 0,
    total_deductions numeric(14,2) DEFAULT 0,
    taxable_income numeric(14,2) DEFAULT 0,
    tax_before_cess numeric(14,2) DEFAULT 0,
    rebate_87a numeric(14,2) DEFAULT 0,
    education_cess numeric(14,2) DEFAULT 0,
    total_tax numeric(14,2) DEFAULT 0,
    tds_deducted numeric(14,2) DEFAULT 0,
    tax_due numeric(14,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Draft'::character varying,
    computed_at timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_emp_tax_computation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_emp_tax_computation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_emp_tax_computation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_emp_tax_computation_id_seq OWNED BY public.t_emp_tax_computation.id;


--
-- Name: t_emp_tax_investment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_emp_tax_investment (
    id integer NOT NULL,
    empid integer NOT NULL,
    financial_year character varying(20) NOT NULL,
    section character varying(20) NOT NULL,
    description character varying(200),
    amount numeric(14,2) DEFAULT 0,
    proof_attached boolean DEFAULT false,
    declared_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: t_emp_tax_investment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_emp_tax_investment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_emp_tax_investment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_emp_tax_investment_id_seq OWNED BY public.t_emp_tax_investment.id;


--
-- Name: t_emp_tax_regime; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_emp_tax_regime (
    id integer NOT NULL,
    empid integer NOT NULL,
    financial_year character varying(20) NOT NULL,
    regime character varying(10) DEFAULT 'new'::character varying NOT NULL,
    created_date date,
    updated_at timestamp with time zone,
    CONSTRAINT t_emp_tax_regime_regime_check CHECK (((regime)::text = ANY (ARRAY[('old'::character varying)::text, ('new'::character varying)::text])))
);


--
-- Name: t_emp_tax_regime_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_emp_tax_regime_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_emp_tax_regime_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_emp_tax_regime_id_seq OWNED BY public.t_emp_tax_regime.id;


--
-- Name: t_exit_application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_exit_application (
    id integer NOT NULL,
    empid integer NOT NULL,
    empname character varying(200),
    resignation_date date,
    last_working_day date,
    reason text,
    type character varying(30) DEFAULT 'Resignation'::character varying,
    status character varying(20) DEFAULT 'Submitted'::character varying,
    approved_by character varying(100),
    approved_date date,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_exit_application_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_exit_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_exit_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_exit_application_id_seq OWNED BY public.t_exit_application.id;


--
-- Name: t_exit_clearance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_exit_clearance (
    id integer NOT NULL,
    exit_application_id integer NOT NULL,
    department character varying(100) NOT NULL,
    cleared_by character varying(100),
    cleared_date date,
    status character varying(20) DEFAULT 'Pending'::character varying,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_exit_clearance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_exit_clearance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_exit_clearance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_exit_clearance_id_seq OWNED BY public.t_exit_clearance.id;


--
-- Name: t_final_settlement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_final_settlement (
    id integer NOT NULL,
    exit_application_id integer NOT NULL,
    empid integer,
    full_name character varying(200),
    designation character varying(200),
    department character varying(100),
    date_of_joining date,
    last_working_day date,
    total_tenure_years numeric(5,2),
    notice_period_days integer DEFAULT 0,
    notice_period_amount numeric(12,2) DEFAULT 0,
    notice_recovered boolean DEFAULT false,
    leave_balance_days numeric(5,1) DEFAULT 0,
    leave_encashment_amount numeric(12,2) DEFAULT 0,
    gratuity_eligible boolean DEFAULT false,
    gratuity_amount numeric(12,2) DEFAULT 0,
    salary_due_days integer DEFAULT 0,
    salary_due_amount numeric(12,2) DEFAULT 0,
    other_earnings numeric(12,2) DEFAULT 0,
    other_deductions numeric(12,2) DEFAULT 0,
    other_deductions_remarks text,
    gross_payable numeric(14,2) DEFAULT 0,
    tds_deducted numeric(12,2) DEFAULT 0,
    net_payable numeric(14,2) DEFAULT 0,
    settlement_date date,
    status character varying(20) DEFAULT 'Draft'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_final_settlement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_final_settlement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_final_settlement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_final_settlement_id_seq OWNED BY public.t_final_settlement.id;


--
-- Name: t_gate_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_gate_entry (
    id integer NOT NULL,
    entry_no character varying(30) NOT NULL,
    entry_date date NOT NULL,
    entry_type character varying(20) NOT NULL,
    reference_type character varying(30),
    reference_no character varying(50),
    party_name character varying(200),
    vehicle_no character varying(50),
    driver_name character varying(100),
    transporter character varying(100),
    remarks text,
    status character varying(20) DEFAULT 'Open'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_gate_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_gate_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_gate_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_gate_entry_id_seq OWNED BY public.t_gate_entry.id;


--
-- Name: t_gate_entry_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_gate_entry_item (
    id integer NOT NULL,
    gate_entry_id integer NOT NULL,
    item_description character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit character varying(30),
    remarks text
);


--
-- Name: t_gate_entry_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_gate_entry_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_gate_entry_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_gate_entry_item_id_seq OWNED BY public.t_gate_entry_item.id;


--
-- Name: t_ir; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_ir (
    id integer NOT NULL,
    grn_no character varying(50) NOT NULL,
    grn_date date NOT NULL,
    po_id integer,
    supplier_id integer NOT NULL,
    invoice_no character varying(50),
    invoice_date date,
    gate_entry_no character varying(50),
    status character varying(30) DEFAULT 'Received'::character varying,
    received_by character varying(100),
    notes text,
    created_date date,
    updated_at timestamp with time zone,
    cost_posted boolean DEFAULT false NOT NULL,
    approval_status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    approved_by character varying(100),
    approved_date date,
    approval_remarks text,
    qa_status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    qa_by character varying(100),
    qa_date date,
    qa_remarks text,
    bill_no character varying(20),
    bill_date date,
    ir_type character varying(20) DEFAULT 'GRR'::character varying NOT NULL,
    pr_id integer,
    inward_date date,
    dept_cd character varying(50),
    year character varying(4)
);


--
-- Name: t_grn_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_grn_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_grn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_grn_id_seq OWNED BY public.t_ir.id;


--
-- Name: t_ir_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_ir_item (
    id integer NOT NULL,
    grn_id integer NOT NULL,
    po_item_id integer,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    ordered_qty numeric(12,2) DEFAULT 0,
    received_qty numeric(12,2) DEFAULT 0,
    accepted_qty numeric(12,2) DEFAULT 0,
    rejected_qty numeric(12,2) DEFAULT 0,
    reject_reason text,
    rate numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0,
    gst_rate numeric(5,2) DEFAULT 0,
    gst_amount numeric(14,2) DEFAULT 0,
    pr_item_id integer,
    uom character varying(20),
    rep character varying(30),
    dia numeric(10,2) DEFAULT 0,
    len numeric(10,2) DEFAULT 0,
    wid numeric(10,2) DEFAULT 0,
    thk numeric(10,2) DEFAULT 0,
    kg numeric(12,3) DEFAULT 0,
    recv_kg numeric(12,3) DEFAULT 0,
    accp numeric(12,3) DEFAULT 0,
    phy numeric(12,3) DEFAULT 0,
    weight numeric(12,3) DEFAULT 0,
    pr_no character varying(50),
    po_no character varying(50),
    supp_qty numeric(12,2) DEFAULT 0
);


--
-- Name: t_grn_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_grn_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_grn_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_grn_item_id_seq OWNED BY public.t_ir_item.id;


--
-- Name: t_interview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_interview (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    requisition_id integer,
    round integer DEFAULT 1,
    interview_date timestamp with time zone,
    interviewer character varying(200),
    mode character varying(50) DEFAULT 'In-person'::character varying,
    status character varying(20) DEFAULT 'Scheduled'::character varying,
    feedback text,
    rating integer,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_interview_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_interview_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_interview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_interview_id_seq OWNED BY public.t_interview.id;


--
-- Name: t_invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_invoice (
    id integer NOT NULL,
    invoice_no character varying(30) NOT NULL,
    invoice_date date NOT NULL,
    party_id integer,
    party_name character varying(200),
    party_gstin character varying(20),
    address text,
    place_of_supply character varying(50),
    dc_id integer,
    dc_no character varying(30),
    subtotal numeric(14,2) DEFAULT 0,
    total_cgst numeric(14,2) DEFAULT 0,
    total_sgst numeric(14,2) DEFAULT 0,
    total_igst numeric(14,2) DEFAULT 0,
    grand_total numeric(14,2) DEFAULT 0,
    remarks text,
    status character varying(20) DEFAULT 'Draft'::character varying,
    created_date date,
    updated_at timestamp with time zone,
    paid_status character varying(20) DEFAULT 'Unpaid'::character varying NOT NULL
);


--
-- Name: t_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_invoice_id_seq OWNED BY public.t_invoice.id;


--
-- Name: t_invoice_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_invoice_item (
    id integer NOT NULL,
    invoice_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    hsn_code character varying(20),
    quantity numeric(12,2) DEFAULT 0,
    unit_id integer,
    rate numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    taxable_amount numeric(14,2) DEFAULT 0,
    cgst_rate numeric(5,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    cgst numeric(14,2) DEFAULT 0,
    sgst numeric(14,2) DEFAULT 0,
    igst numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0
);


--
-- Name: t_invoice_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_invoice_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_invoice_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_invoice_item_id_seq OWNED BY public.t_invoice_item.id;


--
-- Name: t_job_requisition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_job_requisition (
    id integer NOT NULL,
    req_no character varying(30) NOT NULL,
    position_title character varying(200) NOT NULL,
    department character varying(100),
    no_of_positions integer DEFAULT 1,
    qualification text,
    experience_years integer,
    location character varying(200),
    salary_range character varying(100),
    description text,
    status character varying(20) DEFAULT 'Draft'::character varying,
    requested_by character varying(100),
    approved_by character varying(100),
    approved_date date,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_job_requisition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_job_requisition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_job_requisition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_job_requisition_id_seq OWNED BY public.t_job_requisition.id;


--
-- Name: t_kra_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_kra_template (
    id integer NOT NULL,
    template_name character varying(200) NOT NULL,
    department character varying(100),
    designation character varying(100),
    financial_year character varying(20),
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_kra_template_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_kra_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_kra_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_kra_template_id_seq OWNED BY public.t_kra_template.id;


--
-- Name: t_kra_template_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_kra_template_item (
    id integer NOT NULL,
    template_id integer NOT NULL,
    kpi_name character varying(300) NOT NULL,
    weightage numeric(5,2) DEFAULT 0,
    target character varying(200),
    measurement_unit character varying(100),
    description text,
    sort_order integer DEFAULT 0,
    created_date date
);


--
-- Name: t_kra_template_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_kra_template_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_kra_template_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_kra_template_item_id_seq OWNED BY public.t_kra_template_item.id;


--
-- Name: t_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_leads (
    id integer NOT NULL,
    lead_no character varying(50) NOT NULL,
    customer_id integer,
    contact_name character varying(100),
    company_name character varying(255),
    email character varying(100),
    phone character varying(20),
    source character varying(50),
    status public.enum_t_leads_status DEFAULT 'New'::public.enum_t_leads_status,
    priority public.enum_t_leads_priority DEFAULT 'Medium'::public.enum_t_leads_priority,
    product_interest text,
    notes text,
    assigned_to integer,
    expected_value numeric(14,2) DEFAULT 0,
    closure_date date,
    lost_reason text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_leads_id_seq OWNED BY public.t_leads.id;


--
-- Name: t_maintenance_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_maintenance_schedule (
    id integer NOT NULL,
    schedule_no character varying(50) NOT NULL,
    machine_id integer,
    asset_id integer,
    task_name character varying(200) NOT NULL,
    frequency character varying(30),
    last_done_date date,
    next_due_date date,
    assigned_to character varying(100),
    status public.enum_t_maintenance_schedule_status DEFAULT 'Pending'::public.enum_t_maintenance_schedule_status,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_maintenance_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_maintenance_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_maintenance_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_maintenance_schedule_id_seq OWNED BY public.t_maintenance_schedule.id;


--
-- Name: t_material_issue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_issue (
    id integer NOT NULL,
    issue_no character varying(30) NOT NULL,
    issue_date date NOT NULL,
    req_id integer,
    issued_to character varying(100),
    department character varying(100),
    issued_by character varying(100),
    received_by character varying(100),
    status character varying(20),
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_material_issue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_issue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_issue_id_seq OWNED BY public.t_material_issue.id;


--
-- Name: t_material_issue_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_issue_item (
    id integer NOT NULL,
    issue_id integer NOT NULL,
    req_item_id integer,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    batch_no character varying(50),
    rack_id integer,
    remarks text
);


--
-- Name: t_material_issue_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_issue_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_issue_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_issue_item_id_seq OWNED BY public.t_material_issue_item.id;


--
-- Name: t_material_requisition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_requisition (
    id integer NOT NULL,
    req_no character varying(30) NOT NULL,
    req_date date NOT NULL,
    department character varying(100),
    requested_by character varying(100),
    status character varying(30),
    remarks text,
    approved_by character varying(100),
    approved_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_material_requisition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_requisition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_requisition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_requisition_id_seq OWNED BY public.t_material_requisition.id;


--
-- Name: t_material_requisition_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_requisition_item (
    id integer NOT NULL,
    req_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    issued_quantity numeric(12,2) DEFAULT 0,
    pending_quantity numeric(12,2) DEFAULT 0,
    unit_id integer,
    remarks text,
    item_status character varying(20) DEFAULT 'Pending'::character varying
);


--
-- Name: t_material_requisition_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_requisition_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_requisition_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_requisition_item_id_seq OWNED BY public.t_material_requisition_item.id;


--
-- Name: t_material_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_return (
    id integer NOT NULL,
    return_no character varying(30) NOT NULL,
    return_date date NOT NULL,
    return_type character varying(20) NOT NULL,
    party_id integer,
    party_name character varying(200),
    reference_type character varying(30),
    reference_no character varying(50),
    returned_by character varying(100),
    received_by character varying(100),
    status character varying(20) DEFAULT 'Draft'::character varying,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_material_return_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_return_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_return_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_return_id_seq OWNED BY public.t_material_return.id;


--
-- Name: t_material_return_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_material_return_item (
    id integer NOT NULL,
    return_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    batch_no character varying(50),
    remarks text
);


--
-- Name: t_material_return_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_material_return_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_material_return_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_material_return_item_id_seq OWNED BY public.t_material_return_item.id;


--
-- Name: t_non_conformance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_non_conformance (
    id integer NOT NULL,
    nc_no character varying(50) NOT NULL,
    inspection_id integer,
    nc_type public.enum_t_non_conformance_nc_type NOT NULL,
    description text NOT NULL,
    root_cause text,
    corrective_action text,
    preventive_action text,
    status public.enum_t_non_conformance_status DEFAULT 'Open'::public.enum_t_non_conformance_status,
    severity public.enum_t_non_conformance_severity DEFAULT 'Medium'::public.enum_t_non_conformance_severity,
    reported_by character varying(100),
    assigned_to character varying(100),
    resolution_date date,
    remarks text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_non_conformance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_non_conformance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_non_conformance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_non_conformance_id_seq OWNED BY public.t_non_conformance.id;


--
-- Name: t_offer_letter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_offer_letter (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    offer_no character varying(30) NOT NULL,
    position_title character varying(200),
    department character varying(100),
    ctc numeric(14,2),
    joining_date date,
    status character varying(20) DEFAULT 'Draft'::character varying,
    issued_date date,
    accepted_date date,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_offer_letter_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_offer_letter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_offer_letter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_offer_letter_id_seq OWNED BY public.t_offer_letter.id;


--
-- Name: t_pf_challan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_pf_challan (
    id integer NOT NULL,
    challan_no character varying(30),
    financial_year character varying(20),
    month integer,
    total_employees integer DEFAULT 0,
    total_wages numeric(14,2) DEFAULT 0,
    total_employee_share numeric(14,2) DEFAULT 0,
    total_employer_share numeric(14,2) DEFAULT 0,
    total_eps numeric(14,2) DEFAULT 0,
    total_epf numeric(14,2) DEFAULT 0,
    grand_total numeric(14,2) DEFAULT 0,
    remitted_date date,
    status character varying(20) DEFAULT 'Draft'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_pf_challan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_pf_challan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_pf_challan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_pf_challan_id_seq OWNED BY public.t_pf_challan.id;


--
-- Name: t_pf_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_pf_ledger (
    id integer NOT NULL,
    empid integer NOT NULL,
    financial_year character varying(20),
    month integer,
    pf_wages numeric(12,2) DEFAULT 0,
    employee_share numeric(12,2) DEFAULT 0,
    employer_share numeric(12,2) DEFAULT 0,
    eps_share numeric(12,2) DEFAULT 0,
    epf_share numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_pf_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_pf_ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_pf_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_pf_ledger_id_seq OWNED BY public.t_pf_ledger.id;


--
-- Name: t_planning_capacity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_planning_capacity (
    id integer NOT NULL,
    plan_no character varying(50) NOT NULL,
    work_center character varying(100),
    date date,
    available_capacity numeric(12,2),
    used_capacity numeric(12,2),
    load_percentage numeric(5,2),
    status character varying(30) DEFAULT 'Active'::character varying,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_planning_capacity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_planning_capacity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_planning_capacity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_planning_capacity_id_seq OWNED BY public.t_planning_capacity.id;


--
-- Name: t_planning_mrp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_planning_mrp (
    id integer NOT NULL,
    run_no character varying(50) NOT NULL,
    run_date date,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200),
    gross_requirement numeric(14,2),
    scheduled_receipts numeric(14,2),
    net_requirement numeric(14,2),
    planned_orders numeric(14,2),
    status character varying(30) DEFAULT 'Generated'::character varying,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_planning_mrp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_planning_mrp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_planning_mrp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_planning_mrp_id_seq OWNED BY public.t_planning_mrp.id;


--
-- Name: t_planning_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_planning_schedule (
    id integer NOT NULL,
    schedule_no character varying(50) NOT NULL,
    order_id integer,
    machine_id integer,
    scheduled_date date,
    shift character varying(20),
    planned_qty numeric(12,2),
    status public.enum_t_planning_schedule_status DEFAULT 'Planned'::public.enum_t_planning_schedule_status,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_planning_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_planning_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_planning_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_planning_schedule_id_seq OWNED BY public.t_planning_schedule.id;


--
-- Name: t_pr_amendment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_pr_amendment (
    id integer NOT NULL,
    requisition_id integer NOT NULL,
    amended_by character varying(100),
    amendment_date timestamp with time zone,
    change_summary text,
    old_value jsonb,
    new_value jsonb
);


--
-- Name: t_pr_amendment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_pr_amendment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_pr_amendment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_pr_amendment_id_seq OWNED BY public.t_pr_amendment.id;


--
-- Name: t_pr_sanction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_pr_sanction (
    id integer NOT NULL,
    requisition_id integer NOT NULL,
    pr_item_id integer NOT NULL,
    supplier_id integer NOT NULL,
    sanctioned_qty numeric(12,2) DEFAULT 0 NOT NULL,
    rate numeric(14,2),
    status character varying(30) DEFAULT 'Sanctioned'::character varying,
    remarks text,
    sanctioned_by character varying(100),
    sanctioned_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_pr_sanction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_pr_sanction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_pr_sanction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_pr_sanction_id_seq OWNED BY public.t_pr_sanction.id;


--
-- Name: t_production_daily_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_production_daily_entry (
    id integer NOT NULL,
    entry_date date NOT NULL,
    shift public.enum_t_production_daily_entry_shift DEFAULT 'General'::public.enum_t_production_daily_entry_shift,
    machine_id integer,
    machine_code character varying(50),
    machine_name character varying(200),
    order_id integer,
    order_no character varying(50),
    product_code character varying(50),
    product_name character varying(200),
    operator_name character varying(100),
    planned_qty numeric(12,2) DEFAULT 0,
    produced_qty numeric(12,2) DEFAULT 0,
    rejected_qty numeric(12,2) DEFAULT 0,
    downtime_minutes integer DEFAULT 0,
    downtime_reason text,
    notes text,
    status public.enum_t_production_daily_entry_status DEFAULT 'Pending'::public.enum_t_production_daily_entry_status,
    recorded_by character varying(100),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_production_daily_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_production_daily_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_production_daily_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_production_daily_entry_id_seq OWNED BY public.t_production_daily_entry.id;


--
-- Name: t_production_downtime; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_production_downtime (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    machine_code character varying(50),
    machine_name character varying(200),
    downtime_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    duration_minutes integer DEFAULT 0,
    category public.enum_t_production_downtime_category DEFAULT 'Breakdown'::public.enum_t_production_downtime_category,
    reason text,
    action_taken text,
    reported_by character varying(100),
    resolved_by character varying(100),
    status public.enum_t_production_downtime_status DEFAULT 'Open'::public.enum_t_production_downtime_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_production_downtime_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_production_downtime_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_production_downtime_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_production_downtime_id_seq OWNED BY public.t_production_downtime.id;


--
-- Name: t_production_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_production_order (
    id integer NOT NULL,
    order_no character varying(50) NOT NULL,
    bom_id integer,
    product_item_id integer,
    product_code character varying(50),
    product_name character varying(200),
    planned_quantity numeric(12,2) NOT NULL,
    produced_quantity numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Planning'::character varying,
    start_date date,
    end_date date,
    department character varying(100),
    remarks text,
    created_date date,
    updated_at timestamp with time zone,
    order_type character varying(20) DEFAULT 'Job Order'::character varying NOT NULL,
    party_id integer,
    party_name character varying(200),
    req_date date,
    jo_date date,
    subject character varying(300),
    reference character varying(200),
    qtn_no character varying(100),
    ref_date date,
    insurance character varying(200),
    inspection character varying(200),
    freight character varying(200),
    freight_forward character varying(200),
    delivery_period character varying(100),
    desp_to character varying(300),
    any_other_terms text,
    payment_terms character varying(100),
    delivery_terms text,
    currency character varying(10),
    notes text,
    subtotal numeric(14,2),
    discount_percent numeric(5,2),
    discount_amount numeric(14,2),
    pf_amount numeric(14,2),
    sgst_amount numeric(14,2),
    cgst_amount numeric(14,2),
    igst_amount numeric(14,2),
    tax_amount numeric(14,2),
    grand_total numeric(14,2),
    old_jo_no character varying(50),
    jo_year character varying(10)
);


--
-- Name: t_production_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_production_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_production_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_production_order_id_seq OWNED BY public.t_production_order.id;


--
-- Name: t_production_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_production_order_item (
    id integer NOT NULL,
    order_id integer NOT NULL,
    item_id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    item_name character varying(200) NOT NULL,
    required_quantity numeric(12,2) NOT NULL,
    issued_quantity numeric(12,2) DEFAULT 0,
    unit_id integer,
    remarks text,
    created_date date
);


--
-- Name: t_production_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_production_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_production_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_production_order_item_id_seq OWNED BY public.t_production_order_item.id;


--
-- Name: t_punch_batch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_punch_batch (
    id integer NOT NULL,
    batch_id character varying(50),
    source character varying(30),
    filename character varying(200),
    total_records integer DEFAULT 0,
    processed_records integer DEFAULT 0,
    status character varying(20) DEFAULT 'Imported'::character varying,
    created_date date
);


--
-- Name: t_punch_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_punch_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_punch_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_punch_batch_id_seq OWNED BY public.t_punch_batch.id;


--
-- Name: t_purchase_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_purchase_order (
    id integer NOT NULL,
    po_no character varying(50) NOT NULL,
    po_date timestamp without time zone NOT NULL,
    supplier_id integer NOT NULL,
    requisition_id integer,
    status character varying(30) DEFAULT 'Draft'::character varying,
    payment_terms character varying(100),
    delivery_terms text,
    subtotal numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(14,2) DEFAULT 0,
    tax_amount numeric(14,2) DEFAULT 0,
    grand_total numeric(14,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'INR'::character varying,
    notes text,
    approved_by character varying(100),
    approved_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone,
    req_date date,
    old_po_no character varying(50),
    old_po_year character varying(10),
    subject character varying(255),
    reference character varying(100),
    qtn_no character varying(100),
    ref_date date,
    qca_req text,
    any_other_terms text,
    delivery_period character varying(100),
    desp_to text,
    insurance character varying(100),
    rem1 character varying(255),
    rem2 character varying(255),
    rem3 character varying(255),
    inspection character varying(100),
    freight character varying(100),
    freight_forward character varying(100),
    currency_val character varying(50),
    req_yn character varying(10),
    ven_code character varying(50)
);


--
-- Name: t_purchase_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_purchase_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_purchase_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_purchase_order_id_seq OWNED BY public.t_purchase_order.id;


--
-- Name: t_purchase_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_purchase_order_item (
    id integer NOT NULL,
    po_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    received_quantity numeric(12,2) DEFAULT 0,
    unit_id integer,
    rate numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0,
    gst_rate numeric(5,2) DEFAULT 0,
    gst_amount numeric(14,2) DEFAULT 0,
    total numeric(14,2) DEFAULT 0,
    delivery_date date,
    hs_code character varying(50),
    pr_no character varying(50),
    act_wt numeric(12,3) DEFAULT 0 NOT NULL,
    off_wt numeric(12,3) DEFAULT 0 NOT NULL,
    disc_percent numeric(5,2) DEFAULT 0 NOT NULL,
    disc_inr numeric(14,2) DEFAULT 0 NOT NULL,
    after_disc numeric(14,2) DEFAULT 0 NOT NULL,
    pf_percent numeric(5,2) DEFAULT 0 NOT NULL,
    pf_inr numeric(14,2) DEFAULT 0 NOT NULL,
    taxable_value numeric(14,2) DEFAULT 0 NOT NULL,
    sgst_rate numeric(5,2) DEFAULT 0 NOT NULL,
    sgst_inr numeric(14,2) DEFAULT 0 NOT NULL,
    cgst_rate numeric(5,2) DEFAULT 0 NOT NULL,
    cgst_inr numeric(14,2) DEFAULT 0 NOT NULL,
    igst_rate numeric(5,2) DEFAULT 0 NOT NULL,
    igst_inr numeric(14,2) DEFAULT 0 NOT NULL,
    total_value numeric(14,2) DEFAULT 0 NOT NULL,
    req_date date,
    remarks text
);


--
-- Name: t_purchase_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_purchase_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_purchase_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_purchase_order_item_id_seq OWNED BY public.t_purchase_order_item.id;


--
-- Name: t_purchase_requisition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_purchase_requisition (
    id integer NOT NULL,
    req_no character varying(50) NOT NULL,
    req_date date NOT NULL,
    department character varying(100),
    requested_by character varying(100),
    indent_type character varying(50),
    status character varying(30) DEFAULT 'Pending'::character varying,
    priority character varying(20) DEFAULT 'Normal'::character varying,
    notes text,
    approved_by character varying(100),
    approved_date timestamp with time zone,
    created_date date,
    updated_at timestamp with time zone,
    sub_department character varying(100)
);


--
-- Name: t_purchase_requisition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_purchase_requisition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_purchase_requisition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_purchase_requisition_id_seq OWNED BY public.t_purchase_requisition.id;


--
-- Name: t_purchase_requisition_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_purchase_requisition_item (
    id integer NOT NULL,
    requisition_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    expected_date date,
    remarks text,
    cost_center character varying(50),
    uom character varying(20),
    purpose character varying(200),
    len numeric(10,2),
    item_no character varying(50),
    kg numeric(12,3),
    mat_code character varying(50),
    mat_desc character varying(200),
    est_cost numeric(14,2)
);


--
-- Name: t_purchase_requisition_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_purchase_requisition_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_purchase_requisition_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_purchase_requisition_item_id_seq OWNED BY public.t_purchase_requisition_item.id;


--
-- Name: t_quality_inspection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_quality_inspection (
    id integer NOT NULL,
    inspection_no character varying(50) NOT NULL,
    inspection_type public.enum_t_quality_inspection_inspection_type NOT NULL,
    reference_type character varying(50),
    reference_id integer,
    reference_no character varying(50),
    item_id integer,
    item_code character varying(50),
    item_name character varying(255),
    supplier_id integer,
    supplier_name character varying(255),
    batch_no character varying(50),
    inspected_qty numeric(12,2) DEFAULT 0,
    accepted_qty numeric(12,2) DEFAULT 0,
    rejected_qty numeric(12,2) DEFAULT 0,
    status public.enum_t_quality_inspection_status DEFAULT 'Pending'::public.enum_t_quality_inspection_status,
    inspector character varying(100),
    inspection_date date,
    result text,
    remarks text,
    created_by integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_quality_inspection_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_quality_inspection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_quality_inspection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_quality_inspection_id_seq OWNED BY public.t_quality_inspection.id;


--
-- Name: t_quality_inspection_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_quality_inspection_items (
    id integer NOT NULL,
    inspection_id integer NOT NULL,
    parameter character varying(255) NOT NULL,
    specification character varying(255),
    method character varying(100),
    observed_value character varying(100),
    result public.enum_t_quality_inspection_items_result DEFAULT 'N/A'::public.enum_t_quality_inspection_items_result,
    remarks text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_quality_inspection_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_quality_inspection_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_quality_inspection_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_quality_inspection_items_id_seq OWNED BY public.t_quality_inspection_items.id;


--
-- Name: t_quotation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_quotation_items (
    id integer NOT NULL,
    quotation_id integer NOT NULL,
    item_description text NOT NULL,
    quantity numeric(12,2) DEFAULT 1,
    unit character varying(20),
    unit_price numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    net_price numeric(14,2) DEFAULT 0,
    total_price numeric(14,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_quotation_items_id_seq OWNED BY public.t_quotation_items.id;


--
-- Name: t_quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_quotations (
    id integer NOT NULL,
    quote_no character varying(50) NOT NULL,
    customer_id integer NOT NULL,
    lead_id integer,
    date date NOT NULL,
    valid_until date,
    subject character varying(255),
    subtotal numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(14,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(14,2) DEFAULT 0,
    shipping_charges numeric(14,2) DEFAULT 0,
    total_amount numeric(14,2) DEFAULT 0,
    status public.enum_t_quotations_status DEFAULT 'Draft'::public.enum_t_quotations_status,
    terms text,
    notes text,
    created_by integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_quotations_id_seq OWNED BY public.t_quotations.id;


--
-- Name: t_rfq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_rfq (
    id integer NOT NULL,
    rfq_no character varying(50) NOT NULL,
    rfq_date date NOT NULL,
    subject character varying(300),
    status character varying(30) DEFAULT 'Open'::character varying,
    closing_date date,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_rfq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_rfq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_rfq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_rfq_id_seq OWNED BY public.t_rfq.id;


--
-- Name: t_rfq_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_rfq_item (
    id integer NOT NULL,
    rfq_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_id integer,
    gst_rate numeric(5,2) DEFAULT 0
);


--
-- Name: t_rfq_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_rfq_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_rfq_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_rfq_item_id_seq OWNED BY public.t_rfq_item.id;


--
-- Name: t_rfq_vendor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_rfq_vendor (
    id integer NOT NULL,
    rfq_id integer NOT NULL,
    supplier_id integer NOT NULL,
    quoted_amount numeric(14,2),
    delivery_days integer,
    validity_days integer,
    remarks text,
    is_selected boolean DEFAULT false,
    gst_rate numeric(5,2) DEFAULT 0,
    gst_amount numeric(14,2) DEFAULT 0,
    total_amount numeric(14,2) DEFAULT 0
);


--
-- Name: t_rfq_vendor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_rfq_vendor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_rfq_vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_rfq_vendor_id_seq OWNED BY public.t_rfq_vendor.id;


--
-- Name: t_sales_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_sales_order_items (
    id integer NOT NULL,
    sales_order_id integer NOT NULL,
    item_description text NOT NULL,
    quantity numeric(12,2) DEFAULT 1,
    unit character varying(20),
    unit_price numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    net_price numeric(14,2) DEFAULT 0,
    total_price numeric(14,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_sales_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_sales_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_sales_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_sales_order_items_id_seq OWNED BY public.t_sales_order_items.id;


--
-- Name: t_sales_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_sales_orders (
    id integer NOT NULL,
    order_no character varying(50) NOT NULL,
    customer_id integer NOT NULL,
    quotation_id integer,
    order_date date NOT NULL,
    delivery_date date,
    subtotal numeric(14,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(14,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(14,2) DEFAULT 0,
    shipping_charges numeric(14,2) DEFAULT 0,
    total_amount numeric(14,2) DEFAULT 0,
    status public.enum_t_sales_orders_status DEFAULT 'Confirmed'::public.enum_t_sales_orders_status,
    payment_terms character varying(100),
    delivery_terms text,
    notes text,
    created_by integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: t_sales_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_sales_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_sales_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_sales_orders_id_seq OWNED BY public.t_sales_orders.id;


--
-- Name: t_sequence_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_sequence_counters (
    id integer NOT NULL,
    prefix character varying(20) NOT NULL,
    financial_year character varying(20) NOT NULL,
    last_number integer DEFAULT 0,
    created_date date DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: t_sequence_counters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_sequence_counters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_sequence_counters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_sequence_counters_id_seq OWNED BY public.t_sequence_counters.id;


--
-- Name: t_show_cause; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_show_cause (
    id integer NOT NULL,
    case_id integer NOT NULL,
    notice_no character varying(30),
    issued_date date,
    response_deadline date,
    charges text,
    employee_response text,
    response_date date,
    status character varying(20) DEFAULT 'Issued'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_show_cause_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_show_cause_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_show_cause_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_show_cause_id_seq OWNED BY public.t_show_cause.id;


--
-- Name: t_skill_matrix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_skill_matrix (
    id integer NOT NULL,
    empid integer NOT NULL,
    skill_name character varying(100) NOT NULL,
    category character varying(100),
    proficiency integer DEFAULT 1,
    years_experience numeric(4,1),
    last_used date,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_skill_matrix_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_skill_matrix_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_skill_matrix_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_skill_matrix_id_seq OWNED BY public.t_skill_matrix.id;


--
-- Name: t_stock_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_stock_audit (
    id integer NOT NULL,
    audit_no character varying(30) NOT NULL,
    audit_date date NOT NULL,
    warehouse character varying(100),
    auditor character varying(100),
    status character varying(20) DEFAULT 'Draft'::character varying,
    remarks text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_stock_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_stock_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_stock_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_stock_audit_id_seq OWNED BY public.t_stock_audit.id;


--
-- Name: t_stock_audit_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_stock_audit_item (
    id integer NOT NULL,
    audit_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    system_qty numeric(12,2) DEFAULT 0 NOT NULL,
    physical_qty numeric(12,2) DEFAULT 0 NOT NULL,
    variance_qty numeric(12,2) DEFAULT 0 NOT NULL,
    unit_id integer,
    remarks text
);


--
-- Name: t_stock_audit_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_stock_audit_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_stock_audit_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_stock_audit_item_id_seq OWNED BY public.t_stock_audit_item.id;


--
-- Name: t_subcontract_issue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_issue (
    id integer NOT NULL,
    issue_no character varying(50) NOT NULL,
    order_id integer NOT NULL,
    issue_date date NOT NULL,
    vendor_id integer,
    vendor_name character varying(200),
    status character varying(30) DEFAULT 'Draft'::character varying,
    notes text,
    created_by character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_subcontract_issue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_issue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_issue_id_seq OWNED BY public.t_subcontract_issue.id;


--
-- Name: t_subcontract_issue_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_issue_item (
    id integer NOT NULL,
    issue_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    uom character varying(20),
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_subcontract_issue_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_issue_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_issue_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_issue_item_id_seq OWNED BY public.t_subcontract_issue_item.id;


--
-- Name: t_subcontract_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_order (
    id integer NOT NULL,
    order_no character varying(50) NOT NULL,
    vendor_id integer NOT NULL,
    vendor_name character varying(200),
    order_date date NOT NULL,
    expected_date date,
    status character varying(30) DEFAULT 'Draft'::character varying,
    total_qty numeric(14,2) DEFAULT 0,
    total_amount numeric(14,2) DEFAULT 0,
    notes text,
    created_by character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_subcontract_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_order_id_seq OWNED BY public.t_subcontract_order.id;


--
-- Name: t_subcontract_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_order_item (
    id integer NOT NULL,
    order_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    uom character varying(20),
    rate numeric(14,2) DEFAULT 0,
    amount numeric(14,2) DEFAULT 0,
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_subcontract_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_order_item_id_seq OWNED BY public.t_subcontract_order_item.id;


--
-- Name: t_subcontract_receipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_receipt (
    id integer NOT NULL,
    receipt_no character varying(50) NOT NULL,
    order_id integer NOT NULL,
    receipt_date date NOT NULL,
    vendor_id integer,
    vendor_name character varying(200),
    status character varying(30) DEFAULT 'Draft'::character varying,
    notes text,
    created_by character varying(100),
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: t_subcontract_receipt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_receipt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_receipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_receipt_id_seq OWNED BY public.t_subcontract_receipt.id;


--
-- Name: t_subcontract_receipt_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_subcontract_receipt_item (
    id integer NOT NULL,
    receipt_id integer NOT NULL,
    item_id integer,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    uom character varying(20),
    notes text,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    accepted_qty numeric(12,2)
);


--
-- Name: t_subcontract_receipt_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_subcontract_receipt_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_subcontract_receipt_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_subcontract_receipt_item_id_seq OWNED BY public.t_subcontract_receipt_item.id;


--
-- Name: t_training_course; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_training_course (
    id integer NOT NULL,
    course_code character varying(30),
    course_name character varying(300) NOT NULL,
    category character varying(100),
    duration_hours integer,
    vendor character varying(200),
    description text,
    is_active boolean DEFAULT true,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_training_course_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_training_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_training_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_training_course_id_seq OWNED BY public.t_training_course.id;


--
-- Name: t_training_participant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_training_participant (
    id integer NOT NULL,
    session_id integer NOT NULL,
    empid integer NOT NULL,
    attendance character varying(20) DEFAULT 'Pending'::character varying,
    score integer,
    feedback text,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_training_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_training_participant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_training_participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_training_participant_id_seq OWNED BY public.t_training_participant.id;


--
-- Name: t_training_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_training_session (
    id integer NOT NULL,
    course_id integer NOT NULL,
    session_code character varying(30),
    trainer character varying(200),
    mode character varying(30) DEFAULT 'Classroom'::character varying,
    location character varying(200),
    start_date date,
    end_date date,
    start_time time without time zone,
    end_time time without time zone,
    status character varying(20) DEFAULT 'Planned'::character varying,
    created_date date,
    updated_at timestamp with time zone
);


--
-- Name: t_training_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_training_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_training_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_training_session_id_seq OWNED BY public.t_training_session.id;


--
-- Name: t_vendor_rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_vendor_rating (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    po_id integer,
    quality_score numeric(5,2) DEFAULT 0,
    delivery_score numeric(5,2) DEFAULT 0,
    price_score numeric(5,2) DEFAULT 0,
    service_score numeric(5,2) DEFAULT 0,
    overall_score numeric(5,2) DEFAULT 0,
    remarks text,
    rated_by character varying(100),
    rating_date date
);


--
-- Name: t_vendor_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_vendor_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_vendor_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_vendor_rating_id_seq OWNED BY public.t_vendor_rating.id;


--
-- Name: tour_application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_application (
    tour_id bigint NOT NULL,
    tour_date timestamp with time zone,
    empid bigint,
    ename character varying(100),
    unit character varying(50),
    division character varying(50),
    designation character varying(50),
    tour_from_date timestamp with time zone,
    tour_to_date timestamp with time zone,
    purpose text,
    destination character varying(200),
    estimated_amount numeric(10,2),
    created_by character varying(50),
    created_date date,
    status character varying(20),
    approval_remark character varying(200),
    approved_by character varying(50),
    approved_date timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password_hash text NOT NULL,
    empid integer,
    role character varying(255),
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    failed_attempts integer DEFAULT 0,
    password_changed_at timestamp with time zone,
    created_by integer,
    created_date date NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voucher_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_items (
    id integer NOT NULL,
    voucher_id integer NOT NULL,
    account_id integer NOT NULL,
    debit numeric(16,2) DEFAULT 0,
    credit numeric(16,2) DEFAULT 0,
    against_account_id integer,
    reference_no character varying(50),
    narration text,
    cost_center_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: voucher_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_items_id_seq OWNED BY public.voucher_items.id;


--
-- Name: voucher_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_types (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: voucher_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_types_id_seq OWNED BY public.voucher_types.id;


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    id integer NOT NULL,
    voucher_no character varying(50) NOT NULL,
    voucher_type_id integer NOT NULL,
    financial_year_id integer,
    date date NOT NULL,
    reference_no character varying(50),
    reference_date date,
    narration text,
    total_debit numeric(16,2) DEFAULT 0,
    total_credit numeric(16,2) DEFAULT 0,
    status public.enum_vouchers_status DEFAULT 'Draft'::public.enum_vouchers_status,
    created_by integer,
    approved_by integer,
    approved_at timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;


--
-- Name: woff_application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.woff_application (
    woff_id bigint NOT NULL,
    woff_date timestamp with time zone,
    empid bigint,
    ename character varying(100),
    unit character varying(50),
    division character varying(50),
    designation character varying(50),
    current_woff_day character varying(20),
    requested_woff_day character varying(20),
    woff_from_date timestamp with time zone,
    woff_to_date timestamp with time zone,
    reason text,
    created_by character varying(50),
    created_date date,
    status character varying(20),
    approval_remark character varying(200),
    approved_by character varying(50),
    approved_date timestamp with time zone,
    department character varying(100),
    section character varying(100),
    shift_cd character varying(20),
    remarks text
);


--
-- Name: EQ_EMP_GATT id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EQ_EMP_GATT" ALTER COLUMN id SET DEFAULT nextval('public."EQ_EMP_GATT_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: accounts_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts_settings ALTER COLUMN id SET DEFAULT nextval('public.accounts_settings_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: chart_of_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('public.chart_of_accounts_id_seq'::regclass);


--
-- Name: emp_attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_attendance ALTER COLUMN id SET DEFAULT nextval('public.emp_attendance_id_seq'::regclass);


--
-- Name: emp_ext_ot id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_ext_ot ALTER COLUMN id SET DEFAULT nextval('public.emp_ext_ot_id_seq'::regclass);


--
-- Name: emp_family_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_family_master ALTER COLUMN id SET DEFAULT nextval('public.emp_family_master_id_seq'::regclass);


--
-- Name: emp_qualification_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_qualification_master ALTER COLUMN id SET DEFAULT nextval('public.emp_qualification_master_id_seq'::regclass);


--
-- Name: financial_years id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_years ALTER COLUMN id SET DEFAULT nextval('public.financial_years_id_seq'::regclass);


--
-- Name: holidays hno; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays ALTER COLUMN hno SET DEFAULT nextval('public.holidays_hno_seq'::regclass);


--
-- Name: leave_approval id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approval ALTER COLUMN id SET DEFAULT nextval('public.leave_approval_id_seq'::regclass);


--
-- Name: leave_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_details ALTER COLUMN id SET DEFAULT nextval('public.leave_details_id_seq'::regclass);


--
-- Name: leave_position lno; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_position ALTER COLUMN lno SET DEFAULT nextval('public.leave_position_lno_seq'::regclass);


--
-- Name: m_company_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_company_settings ALTER COLUMN id SET DEFAULT nextval('public.m_company_settings_id_seq'::regclass);


--
-- Name: m_cost_center id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_cost_center ALTER COLUMN id SET DEFAULT nextval('public.m_cost_center_id_seq'::regclass);


--
-- Name: m_customer_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_customer_master ALTER COLUMN id SET DEFAULT nextval('public.m_customer_master_id_seq'::regclass);


--
-- Name: m_emp_experience id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_experience ALTER COLUMN id SET DEFAULT nextval('public.m_emp_experience_id_seq'::regclass);


--
-- Name: m_emp_family id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_family ALTER COLUMN id SET DEFAULT nextval('public.m_emp_family_id_seq'::regclass);


--
-- Name: m_emp_qualification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_qualification ALTER COLUMN id SET DEFAULT nextval('public.m_emp_qualification_id_seq'::regclass);


--
-- Name: m_engineering_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_engineering_settings ALTER COLUMN id SET DEFAULT nextval('public.m_engineering_settings_id_seq'::regclass);


--
-- Name: m_grn id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn ALTER COLUMN id SET DEFAULT nextval('public.m_grn_id_seq'::regclass);


--
-- Name: m_grn_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn_item ALTER COLUMN id SET DEFAULT nextval('public.m_grn_item_id_seq'::regclass);


--
-- Name: m_item_batch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_batch ALTER COLUMN id SET DEFAULT nextval('public.m_item_batch_id_seq'::regclass);


--
-- Name: m_item_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_group ALTER COLUMN id SET DEFAULT nextval('public.m_item_group_id_seq'::regclass);


--
-- Name: m_item_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master ALTER COLUMN id SET DEFAULT nextval('public.m_item_master_id_seq'::regclass);


--
-- Name: m_item_subgroup id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subgroup ALTER COLUMN id SET DEFAULT nextval('public.m_item_subgroup_id_seq'::regclass);


--
-- Name: m_item_subtype id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subtype ALTER COLUMN id SET DEFAULT nextval('public.m_item_subtype_id_seq'::regclass);


--
-- Name: m_item_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_type ALTER COLUMN id SET DEFAULT nextval('public.m_item_type_id_seq'::regclass);


--
-- Name: m_maintenance_asset id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_asset ALTER COLUMN id SET DEFAULT nextval('public.m_maintenance_asset_id_seq'::regclass);


--
-- Name: m_maintenance_machine id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_machine ALTER COLUMN id SET DEFAULT nextval('public.m_maintenance_machine_id_seq'::regclass);


--
-- Name: m_maintenance_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_settings ALTER COLUMN id SET DEFAULT nextval('public.m_maintenance_settings_id_seq'::regclass);


--
-- Name: m_marketing_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_marketing_settings ALTER COLUMN id SET DEFAULT nextval('public.m_marketing_settings_id_seq'::regclass);


--
-- Name: m_party_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master ALTER COLUMN id SET DEFAULT nextval('public.m_party_master_id_seq'::regclass);


--
-- Name: m_planning_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_planning_settings ALTER COLUMN id SET DEFAULT nextval('public.m_planning_settings_id_seq'::regclass);


--
-- Name: m_product_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_category ALTER COLUMN id SET DEFAULT nextval('public.m_product_category_id_seq'::regclass);


--
-- Name: m_product_item_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_item_master ALTER COLUMN id SET DEFAULT nextval('public.m_product_item_master_id_seq'::regclass);


--
-- Name: m_product_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master ALTER COLUMN id SET DEFAULT nextval('public.m_product_master_id_seq'::regclass);


--
-- Name: m_production_machine id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_machine ALTER COLUMN id SET DEFAULT nextval('public.m_production_machine_id_seq'::regclass);


--
-- Name: m_production_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_settings ALTER COLUMN id SET DEFAULT nextval('public.m_production_settings_id_seq'::regclass);


--
-- Name: m_purchase_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order ALTER COLUMN id SET DEFAULT nextval('public.m_purchase_order_id_seq'::regclass);


--
-- Name: m_purchase_order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order_item ALTER COLUMN id SET DEFAULT nextval('public.m_purchase_order_item_id_seq'::regclass);


--
-- Name: m_purchase_requisition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition ALTER COLUMN id SET DEFAULT nextval('public.m_purchase_requisition_id_seq'::regclass);


--
-- Name: m_purchase_requisition_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition_item ALTER COLUMN id SET DEFAULT nextval('public.m_purchase_requisition_item_id_seq'::regclass);


--
-- Name: m_quality_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_quality_settings ALTER COLUMN id SET DEFAULT nextval('public.m_quality_settings_id_seq'::regclass);


--
-- Name: m_rack id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rack ALTER COLUMN id SET DEFAULT nextval('public.m_rack_id_seq'::regclass);


--
-- Name: m_rfq id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq ALTER COLUMN id SET DEFAULT nextval('public.m_rfq_id_seq'::regclass);


--
-- Name: m_rfq_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_item ALTER COLUMN id SET DEFAULT nextval('public.m_rfq_item_id_seq'::regclass);


--
-- Name: m_rfq_vendor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_vendor ALTER COLUMN id SET DEFAULT nextval('public.m_rfq_vendor_id_seq'::regclass);


--
-- Name: m_subcontract_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_subcontract_settings ALTER COLUMN id SET DEFAULT nextval('public.m_subcontract_settings_id_seq'::regclass);


--
-- Name: m_supplier_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master ALTER COLUMN id SET DEFAULT nextval('public.m_supplier_master_id_seq'::regclass);


--
-- Name: m_unit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit ALTER COLUMN id SET DEFAULT nextval('public.m_unit_id_seq'::regclass);


--
-- Name: m_vendor_price_list id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_vendor_price_list ALTER COLUMN id SET DEFAULT nextval('public.m_vendor_price_list_id_seq'::regclass);


--
-- Name: m_vendor_rating id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_vendor_rating ALTER COLUMN id SET DEFAULT nextval('public.m_vendor_rating_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: salary_register id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_register ALTER COLUMN id SET DEFAULT nextval('public.salary_register_id_seq'::regclass);


--
-- Name: shift_schedule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_schedule ALTER COLUMN id SET DEFAULT nextval('public.shift_schedule_id_seq'::regclass);


--
-- Name: t_appraisal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal ALTER COLUMN id SET DEFAULT nextval('public.t_appraisal_id_seq'::regclass);


--
-- Name: t_appraisal_cycle id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal_cycle ALTER COLUMN id SET DEFAULT nextval('public.t_appraisal_cycle_id_seq'::regclass);


--
-- Name: t_appraisal_rating id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal_rating ALTER COLUMN id SET DEFAULT nextval('public.t_appraisal_rating_id_seq'::regclass);


--
-- Name: t_attendance_raw_punch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_attendance_raw_punch ALTER COLUMN id SET DEFAULT nextval('public.t_attendance_raw_punch_id_seq'::regclass);


--
-- Name: t_bom id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom ALTER COLUMN id SET DEFAULT nextval('public.t_bom_id_seq'::regclass);


--
-- Name: t_bom_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom_item ALTER COLUMN id SET DEFAULT nextval('public.t_bom_item_id_seq'::regclass);


--
-- Name: t_candidate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_candidate ALTER COLUMN id SET DEFAULT nextval('public.t_candidate_id_seq'::regclass);


--
-- Name: t_certification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_certification ALTER COLUMN id SET DEFAULT nextval('public.t_certification_id_seq'::regclass);


--
-- Name: t_delivery_challan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan ALTER COLUMN id SET DEFAULT nextval('public.t_delivery_challan_id_seq'::regclass);


--
-- Name: t_delivery_challan_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan_item ALTER COLUMN id SET DEFAULT nextval('public.t_delivery_challan_item_id_seq'::regclass);


--
-- Name: t_disciplinary_action id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_action ALTER COLUMN id SET DEFAULT nextval('public.t_disciplinary_action_id_seq'::regclass);


--
-- Name: t_disciplinary_case id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case ALTER COLUMN id SET DEFAULT nextval('public.t_disciplinary_case_id_seq'::regclass);


--
-- Name: t_emp_tax_computation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_computation ALTER COLUMN id SET DEFAULT nextval('public.t_emp_tax_computation_id_seq'::regclass);


--
-- Name: t_emp_tax_investment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_investment ALTER COLUMN id SET DEFAULT nextval('public.t_emp_tax_investment_id_seq'::regclass);


--
-- Name: t_emp_tax_regime id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_regime ALTER COLUMN id SET DEFAULT nextval('public.t_emp_tax_regime_id_seq'::regclass);


--
-- Name: t_exit_application id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_exit_application ALTER COLUMN id SET DEFAULT nextval('public.t_exit_application_id_seq'::regclass);


--
-- Name: t_exit_clearance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_exit_clearance ALTER COLUMN id SET DEFAULT nextval('public.t_exit_clearance_id_seq'::regclass);


--
-- Name: t_final_settlement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_final_settlement ALTER COLUMN id SET DEFAULT nextval('public.t_final_settlement_id_seq'::regclass);


--
-- Name: t_gate_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry ALTER COLUMN id SET DEFAULT nextval('public.t_gate_entry_id_seq'::regclass);


--
-- Name: t_gate_entry_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry_item ALTER COLUMN id SET DEFAULT nextval('public.t_gate_entry_item_id_seq'::regclass);


--
-- Name: t_interview id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_interview ALTER COLUMN id SET DEFAULT nextval('public.t_interview_id_seq'::regclass);


--
-- Name: t_invoice id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice ALTER COLUMN id SET DEFAULT nextval('public.t_invoice_id_seq'::regclass);


--
-- Name: t_invoice_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice_item ALTER COLUMN id SET DEFAULT nextval('public.t_invoice_item_id_seq'::regclass);


--
-- Name: t_ir id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir ALTER COLUMN id SET DEFAULT nextval('public.t_grn_id_seq'::regclass);


--
-- Name: t_ir_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir_item ALTER COLUMN id SET DEFAULT nextval('public.t_grn_item_id_seq'::regclass);


--
-- Name: t_job_requisition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition ALTER COLUMN id SET DEFAULT nextval('public.t_job_requisition_id_seq'::regclass);


--
-- Name: t_kra_template id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_kra_template ALTER COLUMN id SET DEFAULT nextval('public.t_kra_template_id_seq'::regclass);


--
-- Name: t_kra_template_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_kra_template_item ALTER COLUMN id SET DEFAULT nextval('public.t_kra_template_item_id_seq'::regclass);


--
-- Name: t_leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_leads ALTER COLUMN id SET DEFAULT nextval('public.t_leads_id_seq'::regclass);


--
-- Name: t_maintenance_schedule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_maintenance_schedule ALTER COLUMN id SET DEFAULT nextval('public.t_maintenance_schedule_id_seq'::regclass);


--
-- Name: t_material_issue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue ALTER COLUMN id SET DEFAULT nextval('public.t_material_issue_id_seq'::regclass);


--
-- Name: t_material_issue_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue_item ALTER COLUMN id SET DEFAULT nextval('public.t_material_issue_item_id_seq'::regclass);


--
-- Name: t_material_requisition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition ALTER COLUMN id SET DEFAULT nextval('public.t_material_requisition_id_seq'::regclass);


--
-- Name: t_material_requisition_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition_item ALTER COLUMN id SET DEFAULT nextval('public.t_material_requisition_item_id_seq'::regclass);


--
-- Name: t_material_return id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return ALTER COLUMN id SET DEFAULT nextval('public.t_material_return_id_seq'::regclass);


--
-- Name: t_material_return_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return_item ALTER COLUMN id SET DEFAULT nextval('public.t_material_return_item_id_seq'::regclass);


--
-- Name: t_non_conformance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_non_conformance ALTER COLUMN id SET DEFAULT nextval('public.t_non_conformance_id_seq'::regclass);


--
-- Name: t_offer_letter id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter ALTER COLUMN id SET DEFAULT nextval('public.t_offer_letter_id_seq'::regclass);


--
-- Name: t_pf_challan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan ALTER COLUMN id SET DEFAULT nextval('public.t_pf_challan_id_seq'::regclass);


--
-- Name: t_pf_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_ledger ALTER COLUMN id SET DEFAULT nextval('public.t_pf_ledger_id_seq'::regclass);


--
-- Name: t_planning_capacity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_capacity ALTER COLUMN id SET DEFAULT nextval('public.t_planning_capacity_id_seq'::regclass);


--
-- Name: t_planning_mrp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_mrp ALTER COLUMN id SET DEFAULT nextval('public.t_planning_mrp_id_seq'::regclass);


--
-- Name: t_planning_schedule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_schedule ALTER COLUMN id SET DEFAULT nextval('public.t_planning_schedule_id_seq'::regclass);


--
-- Name: t_pr_amendment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_amendment ALTER COLUMN id SET DEFAULT nextval('public.t_pr_amendment_id_seq'::regclass);


--
-- Name: t_pr_sanction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_sanction ALTER COLUMN id SET DEFAULT nextval('public.t_pr_sanction_id_seq'::regclass);


--
-- Name: t_production_daily_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_daily_entry ALTER COLUMN id SET DEFAULT nextval('public.t_production_daily_entry_id_seq'::regclass);


--
-- Name: t_production_downtime id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_downtime ALTER COLUMN id SET DEFAULT nextval('public.t_production_downtime_id_seq'::regclass);


--
-- Name: t_production_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order ALTER COLUMN id SET DEFAULT nextval('public.t_production_order_id_seq'::regclass);


--
-- Name: t_production_order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order_item ALTER COLUMN id SET DEFAULT nextval('public.t_production_order_item_id_seq'::regclass);


--
-- Name: t_punch_batch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch ALTER COLUMN id SET DEFAULT nextval('public.t_punch_batch_id_seq'::regclass);


--
-- Name: t_purchase_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order ALTER COLUMN id SET DEFAULT nextval('public.t_purchase_order_id_seq'::regclass);


--
-- Name: t_purchase_order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order_item ALTER COLUMN id SET DEFAULT nextval('public.t_purchase_order_item_id_seq'::regclass);


--
-- Name: t_purchase_requisition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition ALTER COLUMN id SET DEFAULT nextval('public.t_purchase_requisition_id_seq'::regclass);


--
-- Name: t_purchase_requisition_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition_item ALTER COLUMN id SET DEFAULT nextval('public.t_purchase_requisition_item_id_seq'::regclass);


--
-- Name: t_quality_inspection id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection ALTER COLUMN id SET DEFAULT nextval('public.t_quality_inspection_id_seq'::regclass);


--
-- Name: t_quality_inspection_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection_items ALTER COLUMN id SET DEFAULT nextval('public.t_quality_inspection_items_id_seq'::regclass);


--
-- Name: t_quotation_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotation_items ALTER COLUMN id SET DEFAULT nextval('public.t_quotation_items_id_seq'::regclass);


--
-- Name: t_quotations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotations ALTER COLUMN id SET DEFAULT nextval('public.t_quotations_id_seq'::regclass);


--
-- Name: t_rfq id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq ALTER COLUMN id SET DEFAULT nextval('public.t_rfq_id_seq'::regclass);


--
-- Name: t_rfq_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_item ALTER COLUMN id SET DEFAULT nextval('public.t_rfq_item_id_seq'::regclass);


--
-- Name: t_rfq_vendor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_vendor ALTER COLUMN id SET DEFAULT nextval('public.t_rfq_vendor_id_seq'::regclass);


--
-- Name: t_sales_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_order_items ALTER COLUMN id SET DEFAULT nextval('public.t_sales_order_items_id_seq'::regclass);


--
-- Name: t_sales_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_orders ALTER COLUMN id SET DEFAULT nextval('public.t_sales_orders_id_seq'::regclass);


--
-- Name: t_sequence_counters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sequence_counters ALTER COLUMN id SET DEFAULT nextval('public.t_sequence_counters_id_seq'::regclass);


--
-- Name: t_show_cause id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause ALTER COLUMN id SET DEFAULT nextval('public.t_show_cause_id_seq'::regclass);


--
-- Name: t_skill_matrix id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_skill_matrix ALTER COLUMN id SET DEFAULT nextval('public.t_skill_matrix_id_seq'::regclass);


--
-- Name: t_stock_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit ALTER COLUMN id SET DEFAULT nextval('public.t_stock_audit_id_seq'::regclass);


--
-- Name: t_stock_audit_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit_item ALTER COLUMN id SET DEFAULT nextval('public.t_stock_audit_item_id_seq'::regclass);


--
-- Name: t_subcontract_issue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_issue_id_seq'::regclass);


--
-- Name: t_subcontract_issue_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue_item ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_issue_item_id_seq'::regclass);


--
-- Name: t_subcontract_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_order_id_seq'::regclass);


--
-- Name: t_subcontract_order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order_item ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_order_item_id_seq'::regclass);


--
-- Name: t_subcontract_receipt id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_receipt_id_seq'::regclass);


--
-- Name: t_subcontract_receipt_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt_item ALTER COLUMN id SET DEFAULT nextval('public.t_subcontract_receipt_item_id_seq'::regclass);


--
-- Name: t_training_course id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course ALTER COLUMN id SET DEFAULT nextval('public.t_training_course_id_seq'::regclass);


--
-- Name: t_training_participant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_participant ALTER COLUMN id SET DEFAULT nextval('public.t_training_participant_id_seq'::regclass);


--
-- Name: t_training_session id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session ALTER COLUMN id SET DEFAULT nextval('public.t_training_session_id_seq'::regclass);


--
-- Name: t_vendor_rating id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_vendor_rating ALTER COLUMN id SET DEFAULT nextval('public.t_vendor_rating_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voucher_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_items ALTER COLUMN id SET DEFAULT nextval('public.voucher_items_id_seq'::regclass);


--
-- Name: voucher_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_types ALTER COLUMN id SET DEFAULT nextval('public.voucher_types_id_seq'::regclass);


--
-- Name: vouchers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);


--
-- Name: EQ_EMP_GATT EQ_EMP_GATT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EQ_EMP_GATT"
    ADD CONSTRAINT "EQ_EMP_GATT_pkey" PRIMARY KEY (id);


--
-- Name: EmpSalaries EmpSalaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmpSalaries"
    ADD CONSTRAINT "EmpSalaries_pkey" PRIMARY KEY (empid);


--
-- Name: Departments PK_Departments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "PK_Departments" PRIMARY KEY ("DeptId");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: Users Users_username_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1" UNIQUE (username);


--
-- Name: Users Users_username_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key10" UNIQUE (username);


--
-- Name: Users Users_username_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key100" UNIQUE (username);


--
-- Name: Users Users_username_key1000; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1000" UNIQUE (username);


--
-- Name: Users Users_username_key1001; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1001" UNIQUE (username);


--
-- Name: Users Users_username_key1002; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1002" UNIQUE (username);


--
-- Name: Users Users_username_key1003; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1003" UNIQUE (username);


--
-- Name: Users Users_username_key1004; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1004" UNIQUE (username);


--
-- Name: Users Users_username_key1005; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1005" UNIQUE (username);


--
-- Name: Users Users_username_key1006; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1006" UNIQUE (username);


--
-- Name: Users Users_username_key1007; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1007" UNIQUE (username);


--
-- Name: Users Users_username_key1008; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1008" UNIQUE (username);


--
-- Name: Users Users_username_key1009; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1009" UNIQUE (username);


--
-- Name: Users Users_username_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key101" UNIQUE (username);


--
-- Name: Users Users_username_key1010; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1010" UNIQUE (username);


--
-- Name: Users Users_username_key1011; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1011" UNIQUE (username);


--
-- Name: Users Users_username_key1012; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1012" UNIQUE (username);


--
-- Name: Users Users_username_key1013; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1013" UNIQUE (username);


--
-- Name: Users Users_username_key1014; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1014" UNIQUE (username);


--
-- Name: Users Users_username_key1015; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1015" UNIQUE (username);


--
-- Name: Users Users_username_key1016; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1016" UNIQUE (username);


--
-- Name: Users Users_username_key1017; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1017" UNIQUE (username);


--
-- Name: Users Users_username_key1018; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1018" UNIQUE (username);


--
-- Name: Users Users_username_key1019; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1019" UNIQUE (username);


--
-- Name: Users Users_username_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key102" UNIQUE (username);


--
-- Name: Users Users_username_key1020; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key1020" UNIQUE (username);


--
-- Name: Users Users_username_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key103" UNIQUE (username);


--
-- Name: Users Users_username_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key104" UNIQUE (username);


--
-- Name: Users Users_username_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key105" UNIQUE (username);


--
-- Name: Users Users_username_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key106" UNIQUE (username);


--
-- Name: Users Users_username_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key107" UNIQUE (username);


--
-- Name: Users Users_username_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key108" UNIQUE (username);


--
-- Name: Users Users_username_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key109" UNIQUE (username);


--
-- Name: Users Users_username_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key11" UNIQUE (username);


--
-- Name: Users Users_username_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key110" UNIQUE (username);


--
-- Name: Users Users_username_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key111" UNIQUE (username);


--
-- Name: Users Users_username_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key112" UNIQUE (username);


--
-- Name: Users Users_username_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key113" UNIQUE (username);


--
-- Name: Users Users_username_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key114" UNIQUE (username);


--
-- Name: Users Users_username_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key115" UNIQUE (username);


--
-- Name: Users Users_username_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key116" UNIQUE (username);


--
-- Name: Users Users_username_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key117" UNIQUE (username);


--
-- Name: Users Users_username_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key118" UNIQUE (username);


--
-- Name: Users Users_username_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key119" UNIQUE (username);


--
-- Name: Users Users_username_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key12" UNIQUE (username);


--
-- Name: Users Users_username_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key120" UNIQUE (username);


--
-- Name: Users Users_username_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key121" UNIQUE (username);


--
-- Name: Users Users_username_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key122" UNIQUE (username);


--
-- Name: Users Users_username_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key123" UNIQUE (username);


--
-- Name: Users Users_username_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key124" UNIQUE (username);


--
-- Name: Users Users_username_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key125" UNIQUE (username);


--
-- Name: Users Users_username_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key126" UNIQUE (username);


--
-- Name: Users Users_username_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key127" UNIQUE (username);


--
-- Name: Users Users_username_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key128" UNIQUE (username);


--
-- Name: Users Users_username_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key129" UNIQUE (username);


--
-- Name: Users Users_username_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key13" UNIQUE (username);


--
-- Name: Users Users_username_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key130" UNIQUE (username);


--
-- Name: Users Users_username_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key131" UNIQUE (username);


--
-- Name: Users Users_username_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key132" UNIQUE (username);


--
-- Name: Users Users_username_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key133" UNIQUE (username);


--
-- Name: Users Users_username_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key134" UNIQUE (username);


--
-- Name: Users Users_username_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key135" UNIQUE (username);


--
-- Name: Users Users_username_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key136" UNIQUE (username);


--
-- Name: Users Users_username_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key137" UNIQUE (username);


--
-- Name: Users Users_username_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key138" UNIQUE (username);


--
-- Name: Users Users_username_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key139" UNIQUE (username);


--
-- Name: Users Users_username_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key14" UNIQUE (username);


--
-- Name: Users Users_username_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key140" UNIQUE (username);


--
-- Name: Users Users_username_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key141" UNIQUE (username);


--
-- Name: Users Users_username_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key142" UNIQUE (username);


--
-- Name: Users Users_username_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key143" UNIQUE (username);


--
-- Name: Users Users_username_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key144" UNIQUE (username);


--
-- Name: Users Users_username_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key145" UNIQUE (username);


--
-- Name: Users Users_username_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key146" UNIQUE (username);


--
-- Name: Users Users_username_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key147" UNIQUE (username);


--
-- Name: Users Users_username_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key148" UNIQUE (username);


--
-- Name: Users Users_username_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key149" UNIQUE (username);


--
-- Name: Users Users_username_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key15" UNIQUE (username);


--
-- Name: Users Users_username_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key150" UNIQUE (username);


--
-- Name: Users Users_username_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key151" UNIQUE (username);


--
-- Name: Users Users_username_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key152" UNIQUE (username);


--
-- Name: Users Users_username_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key153" UNIQUE (username);


--
-- Name: Users Users_username_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key154" UNIQUE (username);


--
-- Name: Users Users_username_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key155" UNIQUE (username);


--
-- Name: Users Users_username_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key156" UNIQUE (username);


--
-- Name: Users Users_username_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key157" UNIQUE (username);


--
-- Name: Users Users_username_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key158" UNIQUE (username);


--
-- Name: Users Users_username_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key159" UNIQUE (username);


--
-- Name: Users Users_username_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key16" UNIQUE (username);


--
-- Name: Users Users_username_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key160" UNIQUE (username);


--
-- Name: Users Users_username_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key161" UNIQUE (username);


--
-- Name: Users Users_username_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key162" UNIQUE (username);


--
-- Name: Users Users_username_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key163" UNIQUE (username);


--
-- Name: Users Users_username_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key164" UNIQUE (username);


--
-- Name: Users Users_username_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key165" UNIQUE (username);


--
-- Name: Users Users_username_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key166" UNIQUE (username);


--
-- Name: Users Users_username_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key167" UNIQUE (username);


--
-- Name: Users Users_username_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key168" UNIQUE (username);


--
-- Name: Users Users_username_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key169" UNIQUE (username);


--
-- Name: Users Users_username_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key17" UNIQUE (username);


--
-- Name: Users Users_username_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key170" UNIQUE (username);


--
-- Name: Users Users_username_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key171" UNIQUE (username);


--
-- Name: Users Users_username_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key172" UNIQUE (username);


--
-- Name: Users Users_username_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key173" UNIQUE (username);


--
-- Name: Users Users_username_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key174" UNIQUE (username);


--
-- Name: Users Users_username_key175; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key175" UNIQUE (username);


--
-- Name: Users Users_username_key176; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key176" UNIQUE (username);


--
-- Name: Users Users_username_key177; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key177" UNIQUE (username);


--
-- Name: Users Users_username_key178; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key178" UNIQUE (username);


--
-- Name: Users Users_username_key179; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key179" UNIQUE (username);


--
-- Name: Users Users_username_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key18" UNIQUE (username);


--
-- Name: Users Users_username_key180; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key180" UNIQUE (username);


--
-- Name: Users Users_username_key181; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key181" UNIQUE (username);


--
-- Name: Users Users_username_key182; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key182" UNIQUE (username);


--
-- Name: Users Users_username_key183; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key183" UNIQUE (username);


--
-- Name: Users Users_username_key184; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key184" UNIQUE (username);


--
-- Name: Users Users_username_key185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key185" UNIQUE (username);


--
-- Name: Users Users_username_key186; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key186" UNIQUE (username);


--
-- Name: Users Users_username_key187; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key187" UNIQUE (username);


--
-- Name: Users Users_username_key188; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key188" UNIQUE (username);


--
-- Name: Users Users_username_key189; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key189" UNIQUE (username);


--
-- Name: Users Users_username_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key19" UNIQUE (username);


--
-- Name: Users Users_username_key190; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key190" UNIQUE (username);


--
-- Name: Users Users_username_key191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key191" UNIQUE (username);


--
-- Name: Users Users_username_key192; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key192" UNIQUE (username);


--
-- Name: Users Users_username_key193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key193" UNIQUE (username);


--
-- Name: Users Users_username_key194; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key194" UNIQUE (username);


--
-- Name: Users Users_username_key195; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key195" UNIQUE (username);


--
-- Name: Users Users_username_key196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key196" UNIQUE (username);


--
-- Name: Users Users_username_key197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key197" UNIQUE (username);


--
-- Name: Users Users_username_key198; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key198" UNIQUE (username);


--
-- Name: Users Users_username_key199; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key199" UNIQUE (username);


--
-- Name: Users Users_username_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key2" UNIQUE (username);


--
-- Name: Users Users_username_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key20" UNIQUE (username);


--
-- Name: Users Users_username_key200; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key200" UNIQUE (username);


--
-- Name: Users Users_username_key201; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key201" UNIQUE (username);


--
-- Name: Users Users_username_key202; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key202" UNIQUE (username);


--
-- Name: Users Users_username_key203; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key203" UNIQUE (username);


--
-- Name: Users Users_username_key204; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key204" UNIQUE (username);


--
-- Name: Users Users_username_key205; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key205" UNIQUE (username);


--
-- Name: Users Users_username_key206; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key206" UNIQUE (username);


--
-- Name: Users Users_username_key207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key207" UNIQUE (username);


--
-- Name: Users Users_username_key208; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key208" UNIQUE (username);


--
-- Name: Users Users_username_key209; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key209" UNIQUE (username);


--
-- Name: Users Users_username_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key21" UNIQUE (username);


--
-- Name: Users Users_username_key210; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key210" UNIQUE (username);


--
-- Name: Users Users_username_key211; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key211" UNIQUE (username);


--
-- Name: Users Users_username_key212; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key212" UNIQUE (username);


--
-- Name: Users Users_username_key213; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key213" UNIQUE (username);


--
-- Name: Users Users_username_key214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key214" UNIQUE (username);


--
-- Name: Users Users_username_key215; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key215" UNIQUE (username);


--
-- Name: Users Users_username_key216; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key216" UNIQUE (username);


--
-- Name: Users Users_username_key217; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key217" UNIQUE (username);


--
-- Name: Users Users_username_key218; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key218" UNIQUE (username);


--
-- Name: Users Users_username_key219; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key219" UNIQUE (username);


--
-- Name: Users Users_username_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key22" UNIQUE (username);


--
-- Name: Users Users_username_key220; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key220" UNIQUE (username);


--
-- Name: Users Users_username_key221; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key221" UNIQUE (username);


--
-- Name: Users Users_username_key222; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key222" UNIQUE (username);


--
-- Name: Users Users_username_key223; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key223" UNIQUE (username);


--
-- Name: Users Users_username_key224; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key224" UNIQUE (username);


--
-- Name: Users Users_username_key225; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key225" UNIQUE (username);


--
-- Name: Users Users_username_key226; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key226" UNIQUE (username);


--
-- Name: Users Users_username_key227; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key227" UNIQUE (username);


--
-- Name: Users Users_username_key228; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key228" UNIQUE (username);


--
-- Name: Users Users_username_key229; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key229" UNIQUE (username);


--
-- Name: Users Users_username_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key23" UNIQUE (username);


--
-- Name: Users Users_username_key230; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key230" UNIQUE (username);


--
-- Name: Users Users_username_key231; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key231" UNIQUE (username);


--
-- Name: Users Users_username_key232; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key232" UNIQUE (username);


--
-- Name: Users Users_username_key233; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key233" UNIQUE (username);


--
-- Name: Users Users_username_key234; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key234" UNIQUE (username);


--
-- Name: Users Users_username_key235; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key235" UNIQUE (username);


--
-- Name: Users Users_username_key236; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key236" UNIQUE (username);


--
-- Name: Users Users_username_key237; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key237" UNIQUE (username);


--
-- Name: Users Users_username_key238; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key238" UNIQUE (username);


--
-- Name: Users Users_username_key239; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key239" UNIQUE (username);


--
-- Name: Users Users_username_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key24" UNIQUE (username);


--
-- Name: Users Users_username_key240; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key240" UNIQUE (username);


--
-- Name: Users Users_username_key241; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key241" UNIQUE (username);


--
-- Name: Users Users_username_key242; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key242" UNIQUE (username);


--
-- Name: Users Users_username_key243; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key243" UNIQUE (username);


--
-- Name: Users Users_username_key244; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key244" UNIQUE (username);


--
-- Name: Users Users_username_key245; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key245" UNIQUE (username);


--
-- Name: Users Users_username_key246; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key246" UNIQUE (username);


--
-- Name: Users Users_username_key247; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key247" UNIQUE (username);


--
-- Name: Users Users_username_key248; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key248" UNIQUE (username);


--
-- Name: Users Users_username_key249; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key249" UNIQUE (username);


--
-- Name: Users Users_username_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key25" UNIQUE (username);


--
-- Name: Users Users_username_key250; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key250" UNIQUE (username);


--
-- Name: Users Users_username_key251; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key251" UNIQUE (username);


--
-- Name: Users Users_username_key252; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key252" UNIQUE (username);


--
-- Name: Users Users_username_key253; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key253" UNIQUE (username);


--
-- Name: Users Users_username_key254; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key254" UNIQUE (username);


--
-- Name: Users Users_username_key255; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key255" UNIQUE (username);


--
-- Name: Users Users_username_key256; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key256" UNIQUE (username);


--
-- Name: Users Users_username_key257; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key257" UNIQUE (username);


--
-- Name: Users Users_username_key258; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key258" UNIQUE (username);


--
-- Name: Users Users_username_key259; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key259" UNIQUE (username);


--
-- Name: Users Users_username_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key26" UNIQUE (username);


--
-- Name: Users Users_username_key260; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key260" UNIQUE (username);


--
-- Name: Users Users_username_key261; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key261" UNIQUE (username);


--
-- Name: Users Users_username_key262; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key262" UNIQUE (username);


--
-- Name: Users Users_username_key263; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key263" UNIQUE (username);


--
-- Name: Users Users_username_key264; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key264" UNIQUE (username);


--
-- Name: Users Users_username_key265; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key265" UNIQUE (username);


--
-- Name: Users Users_username_key266; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key266" UNIQUE (username);


--
-- Name: Users Users_username_key267; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key267" UNIQUE (username);


--
-- Name: Users Users_username_key268; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key268" UNIQUE (username);


--
-- Name: Users Users_username_key269; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key269" UNIQUE (username);


--
-- Name: Users Users_username_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key27" UNIQUE (username);


--
-- Name: Users Users_username_key270; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key270" UNIQUE (username);


--
-- Name: Users Users_username_key271; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key271" UNIQUE (username);


--
-- Name: Users Users_username_key272; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key272" UNIQUE (username);


--
-- Name: Users Users_username_key273; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key273" UNIQUE (username);


--
-- Name: Users Users_username_key274; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key274" UNIQUE (username);


--
-- Name: Users Users_username_key275; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key275" UNIQUE (username);


--
-- Name: Users Users_username_key276; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key276" UNIQUE (username);


--
-- Name: Users Users_username_key277; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key277" UNIQUE (username);


--
-- Name: Users Users_username_key278; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key278" UNIQUE (username);


--
-- Name: Users Users_username_key279; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key279" UNIQUE (username);


--
-- Name: Users Users_username_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key28" UNIQUE (username);


--
-- Name: Users Users_username_key280; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key280" UNIQUE (username);


--
-- Name: Users Users_username_key281; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key281" UNIQUE (username);


--
-- Name: Users Users_username_key282; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key282" UNIQUE (username);


--
-- Name: Users Users_username_key283; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key283" UNIQUE (username);


--
-- Name: Users Users_username_key284; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key284" UNIQUE (username);


--
-- Name: Users Users_username_key285; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key285" UNIQUE (username);


--
-- Name: Users Users_username_key286; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key286" UNIQUE (username);


--
-- Name: Users Users_username_key287; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key287" UNIQUE (username);


--
-- Name: Users Users_username_key288; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key288" UNIQUE (username);


--
-- Name: Users Users_username_key289; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key289" UNIQUE (username);


--
-- Name: Users Users_username_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key29" UNIQUE (username);


--
-- Name: Users Users_username_key290; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key290" UNIQUE (username);


--
-- Name: Users Users_username_key291; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key291" UNIQUE (username);


--
-- Name: Users Users_username_key292; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key292" UNIQUE (username);


--
-- Name: Users Users_username_key293; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key293" UNIQUE (username);


--
-- Name: Users Users_username_key294; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key294" UNIQUE (username);


--
-- Name: Users Users_username_key295; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key295" UNIQUE (username);


--
-- Name: Users Users_username_key296; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key296" UNIQUE (username);


--
-- Name: Users Users_username_key297; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key297" UNIQUE (username);


--
-- Name: Users Users_username_key298; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key298" UNIQUE (username);


--
-- Name: Users Users_username_key299; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key299" UNIQUE (username);


--
-- Name: Users Users_username_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key3" UNIQUE (username);


--
-- Name: Users Users_username_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key30" UNIQUE (username);


--
-- Name: Users Users_username_key300; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key300" UNIQUE (username);


--
-- Name: Users Users_username_key301; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key301" UNIQUE (username);


--
-- Name: Users Users_username_key302; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key302" UNIQUE (username);


--
-- Name: Users Users_username_key303; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key303" UNIQUE (username);


--
-- Name: Users Users_username_key304; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key304" UNIQUE (username);


--
-- Name: Users Users_username_key305; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key305" UNIQUE (username);


--
-- Name: Users Users_username_key306; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key306" UNIQUE (username);


--
-- Name: Users Users_username_key307; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key307" UNIQUE (username);


--
-- Name: Users Users_username_key308; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key308" UNIQUE (username);


--
-- Name: Users Users_username_key309; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key309" UNIQUE (username);


--
-- Name: Users Users_username_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key31" UNIQUE (username);


--
-- Name: Users Users_username_key310; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key310" UNIQUE (username);


--
-- Name: Users Users_username_key311; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key311" UNIQUE (username);


--
-- Name: Users Users_username_key312; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key312" UNIQUE (username);


--
-- Name: Users Users_username_key313; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key313" UNIQUE (username);


--
-- Name: Users Users_username_key314; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key314" UNIQUE (username);


--
-- Name: Users Users_username_key315; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key315" UNIQUE (username);


--
-- Name: Users Users_username_key316; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key316" UNIQUE (username);


--
-- Name: Users Users_username_key317; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key317" UNIQUE (username);


--
-- Name: Users Users_username_key318; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key318" UNIQUE (username);


--
-- Name: Users Users_username_key319; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key319" UNIQUE (username);


--
-- Name: Users Users_username_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key32" UNIQUE (username);


--
-- Name: Users Users_username_key320; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key320" UNIQUE (username);


--
-- Name: Users Users_username_key321; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key321" UNIQUE (username);


--
-- Name: Users Users_username_key322; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key322" UNIQUE (username);


--
-- Name: Users Users_username_key323; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key323" UNIQUE (username);


--
-- Name: Users Users_username_key324; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key324" UNIQUE (username);


--
-- Name: Users Users_username_key325; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key325" UNIQUE (username);


--
-- Name: Users Users_username_key326; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key326" UNIQUE (username);


--
-- Name: Users Users_username_key327; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key327" UNIQUE (username);


--
-- Name: Users Users_username_key328; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key328" UNIQUE (username);


--
-- Name: Users Users_username_key329; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key329" UNIQUE (username);


--
-- Name: Users Users_username_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key33" UNIQUE (username);


--
-- Name: Users Users_username_key330; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key330" UNIQUE (username);


--
-- Name: Users Users_username_key331; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key331" UNIQUE (username);


--
-- Name: Users Users_username_key332; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key332" UNIQUE (username);


--
-- Name: Users Users_username_key333; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key333" UNIQUE (username);


--
-- Name: Users Users_username_key334; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key334" UNIQUE (username);


--
-- Name: Users Users_username_key335; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key335" UNIQUE (username);


--
-- Name: Users Users_username_key336; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key336" UNIQUE (username);


--
-- Name: Users Users_username_key337; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key337" UNIQUE (username);


--
-- Name: Users Users_username_key338; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key338" UNIQUE (username);


--
-- Name: Users Users_username_key339; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key339" UNIQUE (username);


--
-- Name: Users Users_username_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key34" UNIQUE (username);


--
-- Name: Users Users_username_key340; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key340" UNIQUE (username);


--
-- Name: Users Users_username_key341; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key341" UNIQUE (username);


--
-- Name: Users Users_username_key342; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key342" UNIQUE (username);


--
-- Name: Users Users_username_key343; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key343" UNIQUE (username);


--
-- Name: Users Users_username_key344; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key344" UNIQUE (username);


--
-- Name: Users Users_username_key345; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key345" UNIQUE (username);


--
-- Name: Users Users_username_key346; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key346" UNIQUE (username);


--
-- Name: Users Users_username_key347; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key347" UNIQUE (username);


--
-- Name: Users Users_username_key348; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key348" UNIQUE (username);


--
-- Name: Users Users_username_key349; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key349" UNIQUE (username);


--
-- Name: Users Users_username_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key35" UNIQUE (username);


--
-- Name: Users Users_username_key350; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key350" UNIQUE (username);


--
-- Name: Users Users_username_key351; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key351" UNIQUE (username);


--
-- Name: Users Users_username_key352; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key352" UNIQUE (username);


--
-- Name: Users Users_username_key353; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key353" UNIQUE (username);


--
-- Name: Users Users_username_key354; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key354" UNIQUE (username);


--
-- Name: Users Users_username_key355; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key355" UNIQUE (username);


--
-- Name: Users Users_username_key356; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key356" UNIQUE (username);


--
-- Name: Users Users_username_key357; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key357" UNIQUE (username);


--
-- Name: Users Users_username_key358; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key358" UNIQUE (username);


--
-- Name: Users Users_username_key359; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key359" UNIQUE (username);


--
-- Name: Users Users_username_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key36" UNIQUE (username);


--
-- Name: Users Users_username_key360; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key360" UNIQUE (username);


--
-- Name: Users Users_username_key361; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key361" UNIQUE (username);


--
-- Name: Users Users_username_key362; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key362" UNIQUE (username);


--
-- Name: Users Users_username_key363; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key363" UNIQUE (username);


--
-- Name: Users Users_username_key364; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key364" UNIQUE (username);


--
-- Name: Users Users_username_key365; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key365" UNIQUE (username);


--
-- Name: Users Users_username_key366; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key366" UNIQUE (username);


--
-- Name: Users Users_username_key367; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key367" UNIQUE (username);


--
-- Name: Users Users_username_key368; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key368" UNIQUE (username);


--
-- Name: Users Users_username_key369; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key369" UNIQUE (username);


--
-- Name: Users Users_username_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key37" UNIQUE (username);


--
-- Name: Users Users_username_key370; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key370" UNIQUE (username);


--
-- Name: Users Users_username_key371; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key371" UNIQUE (username);


--
-- Name: Users Users_username_key372; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key372" UNIQUE (username);


--
-- Name: Users Users_username_key373; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key373" UNIQUE (username);


--
-- Name: Users Users_username_key374; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key374" UNIQUE (username);


--
-- Name: Users Users_username_key375; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key375" UNIQUE (username);


--
-- Name: Users Users_username_key376; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key376" UNIQUE (username);


--
-- Name: Users Users_username_key377; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key377" UNIQUE (username);


--
-- Name: Users Users_username_key378; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key378" UNIQUE (username);


--
-- Name: Users Users_username_key379; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key379" UNIQUE (username);


--
-- Name: Users Users_username_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key38" UNIQUE (username);


--
-- Name: Users Users_username_key380; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key380" UNIQUE (username);


--
-- Name: Users Users_username_key381; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key381" UNIQUE (username);


--
-- Name: Users Users_username_key382; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key382" UNIQUE (username);


--
-- Name: Users Users_username_key383; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key383" UNIQUE (username);


--
-- Name: Users Users_username_key384; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key384" UNIQUE (username);


--
-- Name: Users Users_username_key385; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key385" UNIQUE (username);


--
-- Name: Users Users_username_key386; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key386" UNIQUE (username);


--
-- Name: Users Users_username_key387; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key387" UNIQUE (username);


--
-- Name: Users Users_username_key388; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key388" UNIQUE (username);


--
-- Name: Users Users_username_key389; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key389" UNIQUE (username);


--
-- Name: Users Users_username_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key39" UNIQUE (username);


--
-- Name: Users Users_username_key390; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key390" UNIQUE (username);


--
-- Name: Users Users_username_key391; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key391" UNIQUE (username);


--
-- Name: Users Users_username_key392; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key392" UNIQUE (username);


--
-- Name: Users Users_username_key393; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key393" UNIQUE (username);


--
-- Name: Users Users_username_key394; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key394" UNIQUE (username);


--
-- Name: Users Users_username_key395; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key395" UNIQUE (username);


--
-- Name: Users Users_username_key396; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key396" UNIQUE (username);


--
-- Name: Users Users_username_key397; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key397" UNIQUE (username);


--
-- Name: Users Users_username_key398; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key398" UNIQUE (username);


--
-- Name: Users Users_username_key399; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key399" UNIQUE (username);


--
-- Name: Users Users_username_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key4" UNIQUE (username);


--
-- Name: Users Users_username_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key40" UNIQUE (username);


--
-- Name: Users Users_username_key400; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key400" UNIQUE (username);


--
-- Name: Users Users_username_key401; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key401" UNIQUE (username);


--
-- Name: Users Users_username_key402; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key402" UNIQUE (username);


--
-- Name: Users Users_username_key403; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key403" UNIQUE (username);


--
-- Name: Users Users_username_key404; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key404" UNIQUE (username);


--
-- Name: Users Users_username_key405; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key405" UNIQUE (username);


--
-- Name: Users Users_username_key406; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key406" UNIQUE (username);


--
-- Name: Users Users_username_key407; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key407" UNIQUE (username);


--
-- Name: Users Users_username_key408; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key408" UNIQUE (username);


--
-- Name: Users Users_username_key409; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key409" UNIQUE (username);


--
-- Name: Users Users_username_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key41" UNIQUE (username);


--
-- Name: Users Users_username_key410; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key410" UNIQUE (username);


--
-- Name: Users Users_username_key411; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key411" UNIQUE (username);


--
-- Name: Users Users_username_key412; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key412" UNIQUE (username);


--
-- Name: Users Users_username_key413; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key413" UNIQUE (username);


--
-- Name: Users Users_username_key414; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key414" UNIQUE (username);


--
-- Name: Users Users_username_key415; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key415" UNIQUE (username);


--
-- Name: Users Users_username_key416; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key416" UNIQUE (username);


--
-- Name: Users Users_username_key417; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key417" UNIQUE (username);


--
-- Name: Users Users_username_key418; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key418" UNIQUE (username);


--
-- Name: Users Users_username_key419; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key419" UNIQUE (username);


--
-- Name: Users Users_username_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key42" UNIQUE (username);


--
-- Name: Users Users_username_key420; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key420" UNIQUE (username);


--
-- Name: Users Users_username_key421; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key421" UNIQUE (username);


--
-- Name: Users Users_username_key422; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key422" UNIQUE (username);


--
-- Name: Users Users_username_key423; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key423" UNIQUE (username);


--
-- Name: Users Users_username_key424; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key424" UNIQUE (username);


--
-- Name: Users Users_username_key425; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key425" UNIQUE (username);


--
-- Name: Users Users_username_key426; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key426" UNIQUE (username);


--
-- Name: Users Users_username_key427; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key427" UNIQUE (username);


--
-- Name: Users Users_username_key428; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key428" UNIQUE (username);


--
-- Name: Users Users_username_key429; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key429" UNIQUE (username);


--
-- Name: Users Users_username_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key43" UNIQUE (username);


--
-- Name: Users Users_username_key430; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key430" UNIQUE (username);


--
-- Name: Users Users_username_key431; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key431" UNIQUE (username);


--
-- Name: Users Users_username_key432; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key432" UNIQUE (username);


--
-- Name: Users Users_username_key433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key433" UNIQUE (username);


--
-- Name: Users Users_username_key434; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key434" UNIQUE (username);


--
-- Name: Users Users_username_key435; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key435" UNIQUE (username);


--
-- Name: Users Users_username_key436; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key436" UNIQUE (username);


--
-- Name: Users Users_username_key437; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key437" UNIQUE (username);


--
-- Name: Users Users_username_key438; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key438" UNIQUE (username);


--
-- Name: Users Users_username_key439; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key439" UNIQUE (username);


--
-- Name: Users Users_username_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key44" UNIQUE (username);


--
-- Name: Users Users_username_key440; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key440" UNIQUE (username);


--
-- Name: Users Users_username_key441; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key441" UNIQUE (username);


--
-- Name: Users Users_username_key442; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key442" UNIQUE (username);


--
-- Name: Users Users_username_key443; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key443" UNIQUE (username);


--
-- Name: Users Users_username_key444; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key444" UNIQUE (username);


--
-- Name: Users Users_username_key445; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key445" UNIQUE (username);


--
-- Name: Users Users_username_key446; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key446" UNIQUE (username);


--
-- Name: Users Users_username_key447; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key447" UNIQUE (username);


--
-- Name: Users Users_username_key448; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key448" UNIQUE (username);


--
-- Name: Users Users_username_key449; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key449" UNIQUE (username);


--
-- Name: Users Users_username_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key45" UNIQUE (username);


--
-- Name: Users Users_username_key450; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key450" UNIQUE (username);


--
-- Name: Users Users_username_key451; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key451" UNIQUE (username);


--
-- Name: Users Users_username_key452; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key452" UNIQUE (username);


--
-- Name: Users Users_username_key453; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key453" UNIQUE (username);


--
-- Name: Users Users_username_key454; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key454" UNIQUE (username);


--
-- Name: Users Users_username_key455; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key455" UNIQUE (username);


--
-- Name: Users Users_username_key456; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key456" UNIQUE (username);


--
-- Name: Users Users_username_key457; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key457" UNIQUE (username);


--
-- Name: Users Users_username_key458; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key458" UNIQUE (username);


--
-- Name: Users Users_username_key459; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key459" UNIQUE (username);


--
-- Name: Users Users_username_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key46" UNIQUE (username);


--
-- Name: Users Users_username_key460; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key460" UNIQUE (username);


--
-- Name: Users Users_username_key461; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key461" UNIQUE (username);


--
-- Name: Users Users_username_key462; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key462" UNIQUE (username);


--
-- Name: Users Users_username_key463; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key463" UNIQUE (username);


--
-- Name: Users Users_username_key464; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key464" UNIQUE (username);


--
-- Name: Users Users_username_key465; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key465" UNIQUE (username);


--
-- Name: Users Users_username_key466; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key466" UNIQUE (username);


--
-- Name: Users Users_username_key467; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key467" UNIQUE (username);


--
-- Name: Users Users_username_key468; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key468" UNIQUE (username);


--
-- Name: Users Users_username_key469; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key469" UNIQUE (username);


--
-- Name: Users Users_username_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key47" UNIQUE (username);


--
-- Name: Users Users_username_key470; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key470" UNIQUE (username);


--
-- Name: Users Users_username_key471; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key471" UNIQUE (username);


--
-- Name: Users Users_username_key472; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key472" UNIQUE (username);


--
-- Name: Users Users_username_key473; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key473" UNIQUE (username);


--
-- Name: Users Users_username_key474; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key474" UNIQUE (username);


--
-- Name: Users Users_username_key475; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key475" UNIQUE (username);


--
-- Name: Users Users_username_key476; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key476" UNIQUE (username);


--
-- Name: Users Users_username_key477; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key477" UNIQUE (username);


--
-- Name: Users Users_username_key478; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key478" UNIQUE (username);


--
-- Name: Users Users_username_key479; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key479" UNIQUE (username);


--
-- Name: Users Users_username_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key48" UNIQUE (username);


--
-- Name: Users Users_username_key480; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key480" UNIQUE (username);


--
-- Name: Users Users_username_key481; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key481" UNIQUE (username);


--
-- Name: Users Users_username_key482; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key482" UNIQUE (username);


--
-- Name: Users Users_username_key483; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key483" UNIQUE (username);


--
-- Name: Users Users_username_key484; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key484" UNIQUE (username);


--
-- Name: Users Users_username_key485; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key485" UNIQUE (username);


--
-- Name: Users Users_username_key486; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key486" UNIQUE (username);


--
-- Name: Users Users_username_key487; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key487" UNIQUE (username);


--
-- Name: Users Users_username_key488; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key488" UNIQUE (username);


--
-- Name: Users Users_username_key489; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key489" UNIQUE (username);


--
-- Name: Users Users_username_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key49" UNIQUE (username);


--
-- Name: Users Users_username_key490; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key490" UNIQUE (username);


--
-- Name: Users Users_username_key491; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key491" UNIQUE (username);


--
-- Name: Users Users_username_key492; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key492" UNIQUE (username);


--
-- Name: Users Users_username_key493; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key493" UNIQUE (username);


--
-- Name: Users Users_username_key494; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key494" UNIQUE (username);


--
-- Name: Users Users_username_key495; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key495" UNIQUE (username);


--
-- Name: Users Users_username_key496; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key496" UNIQUE (username);


--
-- Name: Users Users_username_key497; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key497" UNIQUE (username);


--
-- Name: Users Users_username_key498; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key498" UNIQUE (username);


--
-- Name: Users Users_username_key499; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key499" UNIQUE (username);


--
-- Name: Users Users_username_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key5" UNIQUE (username);


--
-- Name: Users Users_username_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key50" UNIQUE (username);


--
-- Name: Users Users_username_key500; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key500" UNIQUE (username);


--
-- Name: Users Users_username_key501; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key501" UNIQUE (username);


--
-- Name: Users Users_username_key502; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key502" UNIQUE (username);


--
-- Name: Users Users_username_key503; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key503" UNIQUE (username);


--
-- Name: Users Users_username_key504; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key504" UNIQUE (username);


--
-- Name: Users Users_username_key505; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key505" UNIQUE (username);


--
-- Name: Users Users_username_key506; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key506" UNIQUE (username);


--
-- Name: Users Users_username_key507; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key507" UNIQUE (username);


--
-- Name: Users Users_username_key508; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key508" UNIQUE (username);


--
-- Name: Users Users_username_key509; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key509" UNIQUE (username);


--
-- Name: Users Users_username_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key51" UNIQUE (username);


--
-- Name: Users Users_username_key510; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key510" UNIQUE (username);


--
-- Name: Users Users_username_key511; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key511" UNIQUE (username);


--
-- Name: Users Users_username_key512; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key512" UNIQUE (username);


--
-- Name: Users Users_username_key513; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key513" UNIQUE (username);


--
-- Name: Users Users_username_key514; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key514" UNIQUE (username);


--
-- Name: Users Users_username_key515; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key515" UNIQUE (username);


--
-- Name: Users Users_username_key516; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key516" UNIQUE (username);


--
-- Name: Users Users_username_key517; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key517" UNIQUE (username);


--
-- Name: Users Users_username_key518; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key518" UNIQUE (username);


--
-- Name: Users Users_username_key519; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key519" UNIQUE (username);


--
-- Name: Users Users_username_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key52" UNIQUE (username);


--
-- Name: Users Users_username_key520; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key520" UNIQUE (username);


--
-- Name: Users Users_username_key521; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key521" UNIQUE (username);


--
-- Name: Users Users_username_key522; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key522" UNIQUE (username);


--
-- Name: Users Users_username_key523; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key523" UNIQUE (username);


--
-- Name: Users Users_username_key524; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key524" UNIQUE (username);


--
-- Name: Users Users_username_key525; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key525" UNIQUE (username);


--
-- Name: Users Users_username_key526; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key526" UNIQUE (username);


--
-- Name: Users Users_username_key527; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key527" UNIQUE (username);


--
-- Name: Users Users_username_key528; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key528" UNIQUE (username);


--
-- Name: Users Users_username_key529; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key529" UNIQUE (username);


--
-- Name: Users Users_username_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key53" UNIQUE (username);


--
-- Name: Users Users_username_key530; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key530" UNIQUE (username);


--
-- Name: Users Users_username_key531; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key531" UNIQUE (username);


--
-- Name: Users Users_username_key532; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key532" UNIQUE (username);


--
-- Name: Users Users_username_key533; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key533" UNIQUE (username);


--
-- Name: Users Users_username_key534; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key534" UNIQUE (username);


--
-- Name: Users Users_username_key535; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key535" UNIQUE (username);


--
-- Name: Users Users_username_key536; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key536" UNIQUE (username);


--
-- Name: Users Users_username_key537; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key537" UNIQUE (username);


--
-- Name: Users Users_username_key538; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key538" UNIQUE (username);


--
-- Name: Users Users_username_key539; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key539" UNIQUE (username);


--
-- Name: Users Users_username_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key54" UNIQUE (username);


--
-- Name: Users Users_username_key540; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key540" UNIQUE (username);


--
-- Name: Users Users_username_key541; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key541" UNIQUE (username);


--
-- Name: Users Users_username_key542; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key542" UNIQUE (username);


--
-- Name: Users Users_username_key543; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key543" UNIQUE (username);


--
-- Name: Users Users_username_key544; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key544" UNIQUE (username);


--
-- Name: Users Users_username_key545; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key545" UNIQUE (username);


--
-- Name: Users Users_username_key546; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key546" UNIQUE (username);


--
-- Name: Users Users_username_key547; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key547" UNIQUE (username);


--
-- Name: Users Users_username_key548; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key548" UNIQUE (username);


--
-- Name: Users Users_username_key549; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key549" UNIQUE (username);


--
-- Name: Users Users_username_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key55" UNIQUE (username);


--
-- Name: Users Users_username_key550; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key550" UNIQUE (username);


--
-- Name: Users Users_username_key551; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key551" UNIQUE (username);


--
-- Name: Users Users_username_key552; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key552" UNIQUE (username);


--
-- Name: Users Users_username_key553; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key553" UNIQUE (username);


--
-- Name: Users Users_username_key554; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key554" UNIQUE (username);


--
-- Name: Users Users_username_key555; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key555" UNIQUE (username);


--
-- Name: Users Users_username_key556; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key556" UNIQUE (username);


--
-- Name: Users Users_username_key557; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key557" UNIQUE (username);


--
-- Name: Users Users_username_key558; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key558" UNIQUE (username);


--
-- Name: Users Users_username_key559; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key559" UNIQUE (username);


--
-- Name: Users Users_username_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key56" UNIQUE (username);


--
-- Name: Users Users_username_key560; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key560" UNIQUE (username);


--
-- Name: Users Users_username_key561; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key561" UNIQUE (username);


--
-- Name: Users Users_username_key562; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key562" UNIQUE (username);


--
-- Name: Users Users_username_key563; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key563" UNIQUE (username);


--
-- Name: Users Users_username_key564; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key564" UNIQUE (username);


--
-- Name: Users Users_username_key565; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key565" UNIQUE (username);


--
-- Name: Users Users_username_key566; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key566" UNIQUE (username);


--
-- Name: Users Users_username_key567; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key567" UNIQUE (username);


--
-- Name: Users Users_username_key568; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key568" UNIQUE (username);


--
-- Name: Users Users_username_key569; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key569" UNIQUE (username);


--
-- Name: Users Users_username_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key57" UNIQUE (username);


--
-- Name: Users Users_username_key570; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key570" UNIQUE (username);


--
-- Name: Users Users_username_key571; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key571" UNIQUE (username);


--
-- Name: Users Users_username_key572; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key572" UNIQUE (username);


--
-- Name: Users Users_username_key573; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key573" UNIQUE (username);


--
-- Name: Users Users_username_key574; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key574" UNIQUE (username);


--
-- Name: Users Users_username_key575; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key575" UNIQUE (username);


--
-- Name: Users Users_username_key576; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key576" UNIQUE (username);


--
-- Name: Users Users_username_key577; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key577" UNIQUE (username);


--
-- Name: Users Users_username_key578; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key578" UNIQUE (username);


--
-- Name: Users Users_username_key579; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key579" UNIQUE (username);


--
-- Name: Users Users_username_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key58" UNIQUE (username);


--
-- Name: Users Users_username_key580; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key580" UNIQUE (username);


--
-- Name: Users Users_username_key581; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key581" UNIQUE (username);


--
-- Name: Users Users_username_key582; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key582" UNIQUE (username);


--
-- Name: Users Users_username_key583; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key583" UNIQUE (username);


--
-- Name: Users Users_username_key584; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key584" UNIQUE (username);


--
-- Name: Users Users_username_key585; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key585" UNIQUE (username);


--
-- Name: Users Users_username_key586; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key586" UNIQUE (username);


--
-- Name: Users Users_username_key587; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key587" UNIQUE (username);


--
-- Name: Users Users_username_key588; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key588" UNIQUE (username);


--
-- Name: Users Users_username_key589; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key589" UNIQUE (username);


--
-- Name: Users Users_username_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key59" UNIQUE (username);


--
-- Name: Users Users_username_key590; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key590" UNIQUE (username);


--
-- Name: Users Users_username_key591; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key591" UNIQUE (username);


--
-- Name: Users Users_username_key592; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key592" UNIQUE (username);


--
-- Name: Users Users_username_key593; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key593" UNIQUE (username);


--
-- Name: Users Users_username_key594; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key594" UNIQUE (username);


--
-- Name: Users Users_username_key595; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key595" UNIQUE (username);


--
-- Name: Users Users_username_key596; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key596" UNIQUE (username);


--
-- Name: Users Users_username_key597; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key597" UNIQUE (username);


--
-- Name: Users Users_username_key598; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key598" UNIQUE (username);


--
-- Name: Users Users_username_key599; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key599" UNIQUE (username);


--
-- Name: Users Users_username_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key6" UNIQUE (username);


--
-- Name: Users Users_username_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key60" UNIQUE (username);


--
-- Name: Users Users_username_key600; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key600" UNIQUE (username);


--
-- Name: Users Users_username_key601; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key601" UNIQUE (username);


--
-- Name: Users Users_username_key602; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key602" UNIQUE (username);


--
-- Name: Users Users_username_key603; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key603" UNIQUE (username);


--
-- Name: Users Users_username_key604; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key604" UNIQUE (username);


--
-- Name: Users Users_username_key605; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key605" UNIQUE (username);


--
-- Name: Users Users_username_key606; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key606" UNIQUE (username);


--
-- Name: Users Users_username_key607; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key607" UNIQUE (username);


--
-- Name: Users Users_username_key608; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key608" UNIQUE (username);


--
-- Name: Users Users_username_key609; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key609" UNIQUE (username);


--
-- Name: Users Users_username_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key61" UNIQUE (username);


--
-- Name: Users Users_username_key610; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key610" UNIQUE (username);


--
-- Name: Users Users_username_key611; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key611" UNIQUE (username);


--
-- Name: Users Users_username_key612; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key612" UNIQUE (username);


--
-- Name: Users Users_username_key613; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key613" UNIQUE (username);


--
-- Name: Users Users_username_key614; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key614" UNIQUE (username);


--
-- Name: Users Users_username_key615; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key615" UNIQUE (username);


--
-- Name: Users Users_username_key616; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key616" UNIQUE (username);


--
-- Name: Users Users_username_key617; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key617" UNIQUE (username);


--
-- Name: Users Users_username_key618; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key618" UNIQUE (username);


--
-- Name: Users Users_username_key619; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key619" UNIQUE (username);


--
-- Name: Users Users_username_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key62" UNIQUE (username);


--
-- Name: Users Users_username_key620; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key620" UNIQUE (username);


--
-- Name: Users Users_username_key621; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key621" UNIQUE (username);


--
-- Name: Users Users_username_key622; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key622" UNIQUE (username);


--
-- Name: Users Users_username_key623; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key623" UNIQUE (username);


--
-- Name: Users Users_username_key624; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key624" UNIQUE (username);


--
-- Name: Users Users_username_key625; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key625" UNIQUE (username);


--
-- Name: Users Users_username_key626; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key626" UNIQUE (username);


--
-- Name: Users Users_username_key627; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key627" UNIQUE (username);


--
-- Name: Users Users_username_key628; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key628" UNIQUE (username);


--
-- Name: Users Users_username_key629; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key629" UNIQUE (username);


--
-- Name: Users Users_username_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key63" UNIQUE (username);


--
-- Name: Users Users_username_key630; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key630" UNIQUE (username);


--
-- Name: Users Users_username_key631; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key631" UNIQUE (username);


--
-- Name: Users Users_username_key632; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key632" UNIQUE (username);


--
-- Name: Users Users_username_key633; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key633" UNIQUE (username);


--
-- Name: Users Users_username_key634; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key634" UNIQUE (username);


--
-- Name: Users Users_username_key635; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key635" UNIQUE (username);


--
-- Name: Users Users_username_key636; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key636" UNIQUE (username);


--
-- Name: Users Users_username_key637; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key637" UNIQUE (username);


--
-- Name: Users Users_username_key638; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key638" UNIQUE (username);


--
-- Name: Users Users_username_key639; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key639" UNIQUE (username);


--
-- Name: Users Users_username_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key64" UNIQUE (username);


--
-- Name: Users Users_username_key640; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key640" UNIQUE (username);


--
-- Name: Users Users_username_key641; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key641" UNIQUE (username);


--
-- Name: Users Users_username_key642; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key642" UNIQUE (username);


--
-- Name: Users Users_username_key643; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key643" UNIQUE (username);


--
-- Name: Users Users_username_key644; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key644" UNIQUE (username);


--
-- Name: Users Users_username_key645; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key645" UNIQUE (username);


--
-- Name: Users Users_username_key646; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key646" UNIQUE (username);


--
-- Name: Users Users_username_key647; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key647" UNIQUE (username);


--
-- Name: Users Users_username_key648; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key648" UNIQUE (username);


--
-- Name: Users Users_username_key649; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key649" UNIQUE (username);


--
-- Name: Users Users_username_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key65" UNIQUE (username);


--
-- Name: Users Users_username_key650; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key650" UNIQUE (username);


--
-- Name: Users Users_username_key651; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key651" UNIQUE (username);


--
-- Name: Users Users_username_key652; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key652" UNIQUE (username);


--
-- Name: Users Users_username_key653; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key653" UNIQUE (username);


--
-- Name: Users Users_username_key654; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key654" UNIQUE (username);


--
-- Name: Users Users_username_key655; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key655" UNIQUE (username);


--
-- Name: Users Users_username_key656; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key656" UNIQUE (username);


--
-- Name: Users Users_username_key657; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key657" UNIQUE (username);


--
-- Name: Users Users_username_key658; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key658" UNIQUE (username);


--
-- Name: Users Users_username_key659; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key659" UNIQUE (username);


--
-- Name: Users Users_username_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key66" UNIQUE (username);


--
-- Name: Users Users_username_key660; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key660" UNIQUE (username);


--
-- Name: Users Users_username_key661; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key661" UNIQUE (username);


--
-- Name: Users Users_username_key662; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key662" UNIQUE (username);


--
-- Name: Users Users_username_key663; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key663" UNIQUE (username);


--
-- Name: Users Users_username_key664; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key664" UNIQUE (username);


--
-- Name: Users Users_username_key665; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key665" UNIQUE (username);


--
-- Name: Users Users_username_key666; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key666" UNIQUE (username);


--
-- Name: Users Users_username_key667; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key667" UNIQUE (username);


--
-- Name: Users Users_username_key668; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key668" UNIQUE (username);


--
-- Name: Users Users_username_key669; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key669" UNIQUE (username);


--
-- Name: Users Users_username_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key67" UNIQUE (username);


--
-- Name: Users Users_username_key670; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key670" UNIQUE (username);


--
-- Name: Users Users_username_key671; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key671" UNIQUE (username);


--
-- Name: Users Users_username_key672; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key672" UNIQUE (username);


--
-- Name: Users Users_username_key673; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key673" UNIQUE (username);


--
-- Name: Users Users_username_key674; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key674" UNIQUE (username);


--
-- Name: Users Users_username_key675; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key675" UNIQUE (username);


--
-- Name: Users Users_username_key676; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key676" UNIQUE (username);


--
-- Name: Users Users_username_key677; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key677" UNIQUE (username);


--
-- Name: Users Users_username_key678; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key678" UNIQUE (username);


--
-- Name: Users Users_username_key679; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key679" UNIQUE (username);


--
-- Name: Users Users_username_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key68" UNIQUE (username);


--
-- Name: Users Users_username_key680; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key680" UNIQUE (username);


--
-- Name: Users Users_username_key681; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key681" UNIQUE (username);


--
-- Name: Users Users_username_key682; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key682" UNIQUE (username);


--
-- Name: Users Users_username_key683; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key683" UNIQUE (username);


--
-- Name: Users Users_username_key684; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key684" UNIQUE (username);


--
-- Name: Users Users_username_key685; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key685" UNIQUE (username);


--
-- Name: Users Users_username_key686; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key686" UNIQUE (username);


--
-- Name: Users Users_username_key687; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key687" UNIQUE (username);


--
-- Name: Users Users_username_key688; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key688" UNIQUE (username);


--
-- Name: Users Users_username_key689; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key689" UNIQUE (username);


--
-- Name: Users Users_username_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key69" UNIQUE (username);


--
-- Name: Users Users_username_key690; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key690" UNIQUE (username);


--
-- Name: Users Users_username_key691; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key691" UNIQUE (username);


--
-- Name: Users Users_username_key692; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key692" UNIQUE (username);


--
-- Name: Users Users_username_key693; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key693" UNIQUE (username);


--
-- Name: Users Users_username_key694; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key694" UNIQUE (username);


--
-- Name: Users Users_username_key695; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key695" UNIQUE (username);


--
-- Name: Users Users_username_key696; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key696" UNIQUE (username);


--
-- Name: Users Users_username_key697; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key697" UNIQUE (username);


--
-- Name: Users Users_username_key698; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key698" UNIQUE (username);


--
-- Name: Users Users_username_key699; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key699" UNIQUE (username);


--
-- Name: Users Users_username_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key7" UNIQUE (username);


--
-- Name: Users Users_username_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key70" UNIQUE (username);


--
-- Name: Users Users_username_key700; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key700" UNIQUE (username);


--
-- Name: Users Users_username_key701; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key701" UNIQUE (username);


--
-- Name: Users Users_username_key702; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key702" UNIQUE (username);


--
-- Name: Users Users_username_key703; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key703" UNIQUE (username);


--
-- Name: Users Users_username_key704; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key704" UNIQUE (username);


--
-- Name: Users Users_username_key705; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key705" UNIQUE (username);


--
-- Name: Users Users_username_key706; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key706" UNIQUE (username);


--
-- Name: Users Users_username_key707; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key707" UNIQUE (username);


--
-- Name: Users Users_username_key708; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key708" UNIQUE (username);


--
-- Name: Users Users_username_key709; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key709" UNIQUE (username);


--
-- Name: Users Users_username_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key71" UNIQUE (username);


--
-- Name: Users Users_username_key710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key710" UNIQUE (username);


--
-- Name: Users Users_username_key711; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key711" UNIQUE (username);


--
-- Name: Users Users_username_key712; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key712" UNIQUE (username);


--
-- Name: Users Users_username_key713; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key713" UNIQUE (username);


--
-- Name: Users Users_username_key714; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key714" UNIQUE (username);


--
-- Name: Users Users_username_key715; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key715" UNIQUE (username);


--
-- Name: Users Users_username_key716; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key716" UNIQUE (username);


--
-- Name: Users Users_username_key717; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key717" UNIQUE (username);


--
-- Name: Users Users_username_key718; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key718" UNIQUE (username);


--
-- Name: Users Users_username_key719; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key719" UNIQUE (username);


--
-- Name: Users Users_username_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key72" UNIQUE (username);


--
-- Name: Users Users_username_key720; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key720" UNIQUE (username);


--
-- Name: Users Users_username_key721; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key721" UNIQUE (username);


--
-- Name: Users Users_username_key722; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key722" UNIQUE (username);


--
-- Name: Users Users_username_key723; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key723" UNIQUE (username);


--
-- Name: Users Users_username_key724; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key724" UNIQUE (username);


--
-- Name: Users Users_username_key725; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key725" UNIQUE (username);


--
-- Name: Users Users_username_key726; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key726" UNIQUE (username);


--
-- Name: Users Users_username_key727; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key727" UNIQUE (username);


--
-- Name: Users Users_username_key728; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key728" UNIQUE (username);


--
-- Name: Users Users_username_key729; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key729" UNIQUE (username);


--
-- Name: Users Users_username_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key73" UNIQUE (username);


--
-- Name: Users Users_username_key730; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key730" UNIQUE (username);


--
-- Name: Users Users_username_key731; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key731" UNIQUE (username);


--
-- Name: Users Users_username_key732; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key732" UNIQUE (username);


--
-- Name: Users Users_username_key733; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key733" UNIQUE (username);


--
-- Name: Users Users_username_key734; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key734" UNIQUE (username);


--
-- Name: Users Users_username_key735; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key735" UNIQUE (username);


--
-- Name: Users Users_username_key736; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key736" UNIQUE (username);


--
-- Name: Users Users_username_key737; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key737" UNIQUE (username);


--
-- Name: Users Users_username_key738; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key738" UNIQUE (username);


--
-- Name: Users Users_username_key739; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key739" UNIQUE (username);


--
-- Name: Users Users_username_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key74" UNIQUE (username);


--
-- Name: Users Users_username_key740; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key740" UNIQUE (username);


--
-- Name: Users Users_username_key741; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key741" UNIQUE (username);


--
-- Name: Users Users_username_key742; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key742" UNIQUE (username);


--
-- Name: Users Users_username_key743; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key743" UNIQUE (username);


--
-- Name: Users Users_username_key744; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key744" UNIQUE (username);


--
-- Name: Users Users_username_key745; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key745" UNIQUE (username);


--
-- Name: Users Users_username_key746; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key746" UNIQUE (username);


--
-- Name: Users Users_username_key747; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key747" UNIQUE (username);


--
-- Name: Users Users_username_key748; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key748" UNIQUE (username);


--
-- Name: Users Users_username_key749; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key749" UNIQUE (username);


--
-- Name: Users Users_username_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key75" UNIQUE (username);


--
-- Name: Users Users_username_key750; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key750" UNIQUE (username);


--
-- Name: Users Users_username_key751; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key751" UNIQUE (username);


--
-- Name: Users Users_username_key752; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key752" UNIQUE (username);


--
-- Name: Users Users_username_key753; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key753" UNIQUE (username);


--
-- Name: Users Users_username_key754; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key754" UNIQUE (username);


--
-- Name: Users Users_username_key755; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key755" UNIQUE (username);


--
-- Name: Users Users_username_key756; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key756" UNIQUE (username);


--
-- Name: Users Users_username_key757; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key757" UNIQUE (username);


--
-- Name: Users Users_username_key758; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key758" UNIQUE (username);


--
-- Name: Users Users_username_key759; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key759" UNIQUE (username);


--
-- Name: Users Users_username_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key76" UNIQUE (username);


--
-- Name: Users Users_username_key760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key760" UNIQUE (username);


--
-- Name: Users Users_username_key761; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key761" UNIQUE (username);


--
-- Name: Users Users_username_key762; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key762" UNIQUE (username);


--
-- Name: Users Users_username_key763; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key763" UNIQUE (username);


--
-- Name: Users Users_username_key764; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key764" UNIQUE (username);


--
-- Name: Users Users_username_key765; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key765" UNIQUE (username);


--
-- Name: Users Users_username_key766; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key766" UNIQUE (username);


--
-- Name: Users Users_username_key767; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key767" UNIQUE (username);


--
-- Name: Users Users_username_key768; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key768" UNIQUE (username);


--
-- Name: Users Users_username_key769; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key769" UNIQUE (username);


--
-- Name: Users Users_username_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key77" UNIQUE (username);


--
-- Name: Users Users_username_key770; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key770" UNIQUE (username);


--
-- Name: Users Users_username_key771; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key771" UNIQUE (username);


--
-- Name: Users Users_username_key772; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key772" UNIQUE (username);


--
-- Name: Users Users_username_key773; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key773" UNIQUE (username);


--
-- Name: Users Users_username_key774; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key774" UNIQUE (username);


--
-- Name: Users Users_username_key775; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key775" UNIQUE (username);


--
-- Name: Users Users_username_key776; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key776" UNIQUE (username);


--
-- Name: Users Users_username_key777; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key777" UNIQUE (username);


--
-- Name: Users Users_username_key778; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key778" UNIQUE (username);


--
-- Name: Users Users_username_key779; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key779" UNIQUE (username);


--
-- Name: Users Users_username_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key78" UNIQUE (username);


--
-- Name: Users Users_username_key780; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key780" UNIQUE (username);


--
-- Name: Users Users_username_key781; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key781" UNIQUE (username);


--
-- Name: Users Users_username_key782; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key782" UNIQUE (username);


--
-- Name: Users Users_username_key783; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key783" UNIQUE (username);


--
-- Name: Users Users_username_key784; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key784" UNIQUE (username);


--
-- Name: Users Users_username_key785; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key785" UNIQUE (username);


--
-- Name: Users Users_username_key786; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key786" UNIQUE (username);


--
-- Name: Users Users_username_key787; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key787" UNIQUE (username);


--
-- Name: Users Users_username_key788; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key788" UNIQUE (username);


--
-- Name: Users Users_username_key789; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key789" UNIQUE (username);


--
-- Name: Users Users_username_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key79" UNIQUE (username);


--
-- Name: Users Users_username_key790; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key790" UNIQUE (username);


--
-- Name: Users Users_username_key791; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key791" UNIQUE (username);


--
-- Name: Users Users_username_key792; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key792" UNIQUE (username);


--
-- Name: Users Users_username_key793; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key793" UNIQUE (username);


--
-- Name: Users Users_username_key794; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key794" UNIQUE (username);


--
-- Name: Users Users_username_key795; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key795" UNIQUE (username);


--
-- Name: Users Users_username_key796; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key796" UNIQUE (username);


--
-- Name: Users Users_username_key797; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key797" UNIQUE (username);


--
-- Name: Users Users_username_key798; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key798" UNIQUE (username);


--
-- Name: Users Users_username_key799; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key799" UNIQUE (username);


--
-- Name: Users Users_username_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key8" UNIQUE (username);


--
-- Name: Users Users_username_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key80" UNIQUE (username);


--
-- Name: Users Users_username_key800; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key800" UNIQUE (username);


--
-- Name: Users Users_username_key801; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key801" UNIQUE (username);


--
-- Name: Users Users_username_key802; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key802" UNIQUE (username);


--
-- Name: Users Users_username_key803; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key803" UNIQUE (username);


--
-- Name: Users Users_username_key804; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key804" UNIQUE (username);


--
-- Name: Users Users_username_key805; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key805" UNIQUE (username);


--
-- Name: Users Users_username_key806; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key806" UNIQUE (username);


--
-- Name: Users Users_username_key807; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key807" UNIQUE (username);


--
-- Name: Users Users_username_key808; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key808" UNIQUE (username);


--
-- Name: Users Users_username_key809; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key809" UNIQUE (username);


--
-- Name: Users Users_username_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key81" UNIQUE (username);


--
-- Name: Users Users_username_key810; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key810" UNIQUE (username);


--
-- Name: Users Users_username_key811; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key811" UNIQUE (username);


--
-- Name: Users Users_username_key812; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key812" UNIQUE (username);


--
-- Name: Users Users_username_key813; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key813" UNIQUE (username);


--
-- Name: Users Users_username_key814; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key814" UNIQUE (username);


--
-- Name: Users Users_username_key815; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key815" UNIQUE (username);


--
-- Name: Users Users_username_key816; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key816" UNIQUE (username);


--
-- Name: Users Users_username_key817; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key817" UNIQUE (username);


--
-- Name: Users Users_username_key818; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key818" UNIQUE (username);


--
-- Name: Users Users_username_key819; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key819" UNIQUE (username);


--
-- Name: Users Users_username_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key82" UNIQUE (username);


--
-- Name: Users Users_username_key820; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key820" UNIQUE (username);


--
-- Name: Users Users_username_key821; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key821" UNIQUE (username);


--
-- Name: Users Users_username_key822; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key822" UNIQUE (username);


--
-- Name: Users Users_username_key823; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key823" UNIQUE (username);


--
-- Name: Users Users_username_key824; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key824" UNIQUE (username);


--
-- Name: Users Users_username_key825; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key825" UNIQUE (username);


--
-- Name: Users Users_username_key826; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key826" UNIQUE (username);


--
-- Name: Users Users_username_key827; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key827" UNIQUE (username);


--
-- Name: Users Users_username_key828; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key828" UNIQUE (username);


--
-- Name: Users Users_username_key829; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key829" UNIQUE (username);


--
-- Name: Users Users_username_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key83" UNIQUE (username);


--
-- Name: Users Users_username_key830; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key830" UNIQUE (username);


--
-- Name: Users Users_username_key831; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key831" UNIQUE (username);


--
-- Name: Users Users_username_key832; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key832" UNIQUE (username);


--
-- Name: Users Users_username_key833; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key833" UNIQUE (username);


--
-- Name: Users Users_username_key834; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key834" UNIQUE (username);


--
-- Name: Users Users_username_key835; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key835" UNIQUE (username);


--
-- Name: Users Users_username_key836; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key836" UNIQUE (username);


--
-- Name: Users Users_username_key837; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key837" UNIQUE (username);


--
-- Name: Users Users_username_key838; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key838" UNIQUE (username);


--
-- Name: Users Users_username_key839; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key839" UNIQUE (username);


--
-- Name: Users Users_username_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key84" UNIQUE (username);


--
-- Name: Users Users_username_key840; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key840" UNIQUE (username);


--
-- Name: Users Users_username_key841; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key841" UNIQUE (username);


--
-- Name: Users Users_username_key842; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key842" UNIQUE (username);


--
-- Name: Users Users_username_key843; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key843" UNIQUE (username);


--
-- Name: Users Users_username_key844; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key844" UNIQUE (username);


--
-- Name: Users Users_username_key845; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key845" UNIQUE (username);


--
-- Name: Users Users_username_key846; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key846" UNIQUE (username);


--
-- Name: Users Users_username_key847; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key847" UNIQUE (username);


--
-- Name: Users Users_username_key848; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key848" UNIQUE (username);


--
-- Name: Users Users_username_key849; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key849" UNIQUE (username);


--
-- Name: Users Users_username_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key85" UNIQUE (username);


--
-- Name: Users Users_username_key850; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key850" UNIQUE (username);


--
-- Name: Users Users_username_key851; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key851" UNIQUE (username);


--
-- Name: Users Users_username_key852; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key852" UNIQUE (username);


--
-- Name: Users Users_username_key853; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key853" UNIQUE (username);


--
-- Name: Users Users_username_key854; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key854" UNIQUE (username);


--
-- Name: Users Users_username_key855; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key855" UNIQUE (username);


--
-- Name: Users Users_username_key856; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key856" UNIQUE (username);


--
-- Name: Users Users_username_key857; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key857" UNIQUE (username);


--
-- Name: Users Users_username_key858; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key858" UNIQUE (username);


--
-- Name: Users Users_username_key859; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key859" UNIQUE (username);


--
-- Name: Users Users_username_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key86" UNIQUE (username);


--
-- Name: Users Users_username_key860; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key860" UNIQUE (username);


--
-- Name: Users Users_username_key861; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key861" UNIQUE (username);


--
-- Name: Users Users_username_key862; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key862" UNIQUE (username);


--
-- Name: Users Users_username_key863; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key863" UNIQUE (username);


--
-- Name: Users Users_username_key864; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key864" UNIQUE (username);


--
-- Name: Users Users_username_key865; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key865" UNIQUE (username);


--
-- Name: Users Users_username_key866; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key866" UNIQUE (username);


--
-- Name: Users Users_username_key867; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key867" UNIQUE (username);


--
-- Name: Users Users_username_key868; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key868" UNIQUE (username);


--
-- Name: Users Users_username_key869; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key869" UNIQUE (username);


--
-- Name: Users Users_username_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key87" UNIQUE (username);


--
-- Name: Users Users_username_key870; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key870" UNIQUE (username);


--
-- Name: Users Users_username_key871; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key871" UNIQUE (username);


--
-- Name: Users Users_username_key872; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key872" UNIQUE (username);


--
-- Name: Users Users_username_key873; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key873" UNIQUE (username);


--
-- Name: Users Users_username_key874; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key874" UNIQUE (username);


--
-- Name: Users Users_username_key875; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key875" UNIQUE (username);


--
-- Name: Users Users_username_key876; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key876" UNIQUE (username);


--
-- Name: Users Users_username_key877; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key877" UNIQUE (username);


--
-- Name: Users Users_username_key878; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key878" UNIQUE (username);


--
-- Name: Users Users_username_key879; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key879" UNIQUE (username);


--
-- Name: Users Users_username_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key88" UNIQUE (username);


--
-- Name: Users Users_username_key880; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key880" UNIQUE (username);


--
-- Name: Users Users_username_key881; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key881" UNIQUE (username);


--
-- Name: Users Users_username_key882; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key882" UNIQUE (username);


--
-- Name: Users Users_username_key883; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key883" UNIQUE (username);


--
-- Name: Users Users_username_key884; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key884" UNIQUE (username);


--
-- Name: Users Users_username_key885; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key885" UNIQUE (username);


--
-- Name: Users Users_username_key886; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key886" UNIQUE (username);


--
-- Name: Users Users_username_key887; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key887" UNIQUE (username);


--
-- Name: Users Users_username_key888; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key888" UNIQUE (username);


--
-- Name: Users Users_username_key889; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key889" UNIQUE (username);


--
-- Name: Users Users_username_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key89" UNIQUE (username);


--
-- Name: Users Users_username_key890; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key890" UNIQUE (username);


--
-- Name: Users Users_username_key891; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key891" UNIQUE (username);


--
-- Name: Users Users_username_key892; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key892" UNIQUE (username);


--
-- Name: Users Users_username_key893; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key893" UNIQUE (username);


--
-- Name: Users Users_username_key894; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key894" UNIQUE (username);


--
-- Name: Users Users_username_key895; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key895" UNIQUE (username);


--
-- Name: Users Users_username_key896; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key896" UNIQUE (username);


--
-- Name: Users Users_username_key897; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key897" UNIQUE (username);


--
-- Name: Users Users_username_key898; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key898" UNIQUE (username);


--
-- Name: Users Users_username_key899; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key899" UNIQUE (username);


--
-- Name: Users Users_username_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key9" UNIQUE (username);


--
-- Name: Users Users_username_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key90" UNIQUE (username);


--
-- Name: Users Users_username_key900; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key900" UNIQUE (username);


--
-- Name: Users Users_username_key901; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key901" UNIQUE (username);


--
-- Name: Users Users_username_key902; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key902" UNIQUE (username);


--
-- Name: Users Users_username_key903; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key903" UNIQUE (username);


--
-- Name: Users Users_username_key904; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key904" UNIQUE (username);


--
-- Name: Users Users_username_key905; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key905" UNIQUE (username);


--
-- Name: Users Users_username_key906; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key906" UNIQUE (username);


--
-- Name: Users Users_username_key907; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key907" UNIQUE (username);


--
-- Name: Users Users_username_key908; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key908" UNIQUE (username);


--
-- Name: Users Users_username_key909; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key909" UNIQUE (username);


--
-- Name: Users Users_username_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key91" UNIQUE (username);


--
-- Name: Users Users_username_key910; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key910" UNIQUE (username);


--
-- Name: Users Users_username_key911; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key911" UNIQUE (username);


--
-- Name: Users Users_username_key912; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key912" UNIQUE (username);


--
-- Name: Users Users_username_key913; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key913" UNIQUE (username);


--
-- Name: Users Users_username_key914; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key914" UNIQUE (username);


--
-- Name: Users Users_username_key915; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key915" UNIQUE (username);


--
-- Name: Users Users_username_key916; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key916" UNIQUE (username);


--
-- Name: Users Users_username_key917; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key917" UNIQUE (username);


--
-- Name: Users Users_username_key918; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key918" UNIQUE (username);


--
-- Name: Users Users_username_key919; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key919" UNIQUE (username);


--
-- Name: Users Users_username_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key92" UNIQUE (username);


--
-- Name: Users Users_username_key920; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key920" UNIQUE (username);


--
-- Name: Users Users_username_key921; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key921" UNIQUE (username);


--
-- Name: Users Users_username_key922; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key922" UNIQUE (username);


--
-- Name: Users Users_username_key923; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key923" UNIQUE (username);


--
-- Name: Users Users_username_key924; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key924" UNIQUE (username);


--
-- Name: Users Users_username_key925; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key925" UNIQUE (username);


--
-- Name: Users Users_username_key926; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key926" UNIQUE (username);


--
-- Name: Users Users_username_key927; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key927" UNIQUE (username);


--
-- Name: Users Users_username_key928; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key928" UNIQUE (username);


--
-- Name: Users Users_username_key929; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key929" UNIQUE (username);


--
-- Name: Users Users_username_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key93" UNIQUE (username);


--
-- Name: Users Users_username_key930; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key930" UNIQUE (username);


--
-- Name: Users Users_username_key931; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key931" UNIQUE (username);


--
-- Name: Users Users_username_key932; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key932" UNIQUE (username);


--
-- Name: Users Users_username_key933; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key933" UNIQUE (username);


--
-- Name: Users Users_username_key934; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key934" UNIQUE (username);


--
-- Name: Users Users_username_key935; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key935" UNIQUE (username);


--
-- Name: Users Users_username_key936; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key936" UNIQUE (username);


--
-- Name: Users Users_username_key937; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key937" UNIQUE (username);


--
-- Name: Users Users_username_key938; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key938" UNIQUE (username);


--
-- Name: Users Users_username_key939; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key939" UNIQUE (username);


--
-- Name: Users Users_username_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key94" UNIQUE (username);


--
-- Name: Users Users_username_key940; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key940" UNIQUE (username);


--
-- Name: Users Users_username_key941; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key941" UNIQUE (username);


--
-- Name: Users Users_username_key942; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key942" UNIQUE (username);


--
-- Name: Users Users_username_key943; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key943" UNIQUE (username);


--
-- Name: Users Users_username_key944; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key944" UNIQUE (username);


--
-- Name: Users Users_username_key945; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key945" UNIQUE (username);


--
-- Name: Users Users_username_key946; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key946" UNIQUE (username);


--
-- Name: Users Users_username_key947; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key947" UNIQUE (username);


--
-- Name: Users Users_username_key948; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key948" UNIQUE (username);


--
-- Name: Users Users_username_key949; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key949" UNIQUE (username);


--
-- Name: Users Users_username_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key95" UNIQUE (username);


--
-- Name: Users Users_username_key950; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key950" UNIQUE (username);


--
-- Name: Users Users_username_key951; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key951" UNIQUE (username);


--
-- Name: Users Users_username_key952; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key952" UNIQUE (username);


--
-- Name: Users Users_username_key953; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key953" UNIQUE (username);


--
-- Name: Users Users_username_key954; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key954" UNIQUE (username);


--
-- Name: Users Users_username_key955; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key955" UNIQUE (username);


--
-- Name: Users Users_username_key956; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key956" UNIQUE (username);


--
-- Name: Users Users_username_key957; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key957" UNIQUE (username);


--
-- Name: Users Users_username_key958; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key958" UNIQUE (username);


--
-- Name: Users Users_username_key959; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key959" UNIQUE (username);


--
-- Name: Users Users_username_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key96" UNIQUE (username);


--
-- Name: Users Users_username_key960; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key960" UNIQUE (username);


--
-- Name: Users Users_username_key961; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key961" UNIQUE (username);


--
-- Name: Users Users_username_key962; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key962" UNIQUE (username);


--
-- Name: Users Users_username_key963; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key963" UNIQUE (username);


--
-- Name: Users Users_username_key964; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key964" UNIQUE (username);


--
-- Name: Users Users_username_key965; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key965" UNIQUE (username);


--
-- Name: Users Users_username_key966; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key966" UNIQUE (username);


--
-- Name: Users Users_username_key967; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key967" UNIQUE (username);


--
-- Name: Users Users_username_key968; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key968" UNIQUE (username);


--
-- Name: Users Users_username_key969; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key969" UNIQUE (username);


--
-- Name: Users Users_username_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key97" UNIQUE (username);


--
-- Name: Users Users_username_key970; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key970" UNIQUE (username);


--
-- Name: Users Users_username_key971; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key971" UNIQUE (username);


--
-- Name: Users Users_username_key972; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key972" UNIQUE (username);


--
-- Name: Users Users_username_key973; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key973" UNIQUE (username);


--
-- Name: Users Users_username_key974; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key974" UNIQUE (username);


--
-- Name: Users Users_username_key975; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key975" UNIQUE (username);


--
-- Name: Users Users_username_key976; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key976" UNIQUE (username);


--
-- Name: Users Users_username_key977; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key977" UNIQUE (username);


--
-- Name: Users Users_username_key978; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key978" UNIQUE (username);


--
-- Name: Users Users_username_key979; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key979" UNIQUE (username);


--
-- Name: Users Users_username_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key98" UNIQUE (username);


--
-- Name: Users Users_username_key980; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key980" UNIQUE (username);


--
-- Name: Users Users_username_key981; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key981" UNIQUE (username);


--
-- Name: Users Users_username_key982; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key982" UNIQUE (username);


--
-- Name: Users Users_username_key983; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key983" UNIQUE (username);


--
-- Name: Users Users_username_key984; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key984" UNIQUE (username);


--
-- Name: Users Users_username_key985; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key985" UNIQUE (username);


--
-- Name: Users Users_username_key986; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key986" UNIQUE (username);


--
-- Name: Users Users_username_key987; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key987" UNIQUE (username);


--
-- Name: Users Users_username_key988; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key988" UNIQUE (username);


--
-- Name: Users Users_username_key989; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key989" UNIQUE (username);


--
-- Name: Users Users_username_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key99" UNIQUE (username);


--
-- Name: Users Users_username_key990; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key990" UNIQUE (username);


--
-- Name: Users Users_username_key991; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key991" UNIQUE (username);


--
-- Name: Users Users_username_key992; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key992" UNIQUE (username);


--
-- Name: Users Users_username_key993; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key993" UNIQUE (username);


--
-- Name: Users Users_username_key994; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key994" UNIQUE (username);


--
-- Name: Users Users_username_key995; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key995" UNIQUE (username);


--
-- Name: Users Users_username_key996; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key996" UNIQUE (username);


--
-- Name: Users Users_username_key997; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key997" UNIQUE (username);


--
-- Name: Users Users_username_key998; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key998" UNIQUE (username);


--
-- Name: Users Users_username_key999; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key999" UNIQUE (username);


--
-- Name: accounts_settings accounts_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts_settings
    ADD CONSTRAINT accounts_settings_key_key UNIQUE (key);


--
-- Name: accounts_settings accounts_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts_settings
    ADD CONSTRAINT accounts_settings_pkey PRIMARY KEY (id);


--
-- Name: advance_permission advance_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advance_permission
    ADD CONSTRAINT advance_permission_pkey PRIMARY KEY (advance_id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_account_code_key UNIQUE (account_code);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: emp_attendance emp_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_attendance
    ADD CONSTRAINT emp_attendance_pkey PRIMARY KEY (id);


--
-- Name: emp_ext_ot emp_ext_ot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_ext_ot
    ADD CONSTRAINT emp_ext_ot_pkey PRIMARY KEY (id);


--
-- Name: emp_family_master emp_family_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_family_master
    ADD CONSTRAINT emp_family_master_pkey PRIMARY KEY (id);


--
-- Name: emp_payslip emp_payslip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_payslip
    ADD CONSTRAINT emp_payslip_pkey PRIMARY KEY ("C_MONTH", "C_YEAR", "C_EMPID");


--
-- Name: emp_qualification_master emp_qualification_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_qualification_master
    ADD CONSTRAINT emp_qualification_master_pkey PRIMARY KEY (id);


--
-- Name: employee_master employee_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_master
    ADD CONSTRAINT employee_master_pkey PRIMARY KEY (empid);


--
-- Name: employee_movement employee_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_movement
    ADD CONSTRAINT employee_movement_pkey PRIMARY KEY (movement_id);


--
-- Name: esi_leave_permission esi_leave_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esi_leave_permission
    ADD CONSTRAINT esi_leave_permission_pkey PRIMARY KEY (esi_leave_id);


--
-- Name: financial_years financial_years_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_years
    ADD CONSTRAINT financial_years_name_key UNIQUE (name);


--
-- Name: financial_years financial_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_years
    ADD CONSTRAINT financial_years_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (hno);


--
-- Name: leave_application leave_application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_application
    ADD CONSTRAINT leave_application_pkey PRIMARY KEY (lno);


--
-- Name: leave_approval leave_approval_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approval
    ADD CONSTRAINT leave_approval_pkey PRIMARY KEY (id);


--
-- Name: leave_details leave_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_details
    ADD CONSTRAINT leave_details_pkey PRIMARY KEY (id);


--
-- Name: leave_master leave_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_master
    ADD CONSTRAINT leave_master_pkey PRIMARY KEY (empid);


--
-- Name: leave_position leave_position_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_position
    ADD CONSTRAINT leave_position_pkey PRIMARY KEY (lno);


--
-- Name: m_company_settings m_company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_company_settings
    ADD CONSTRAINT m_company_settings_pkey PRIMARY KEY (id);


--
-- Name: m_cost_center m_cost_center_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_cost_center
    ADD CONSTRAINT m_cost_center_name_key UNIQUE (name);


--
-- Name: m_cost_center m_cost_center_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_cost_center
    ADD CONSTRAINT m_cost_center_pkey PRIMARY KEY (id);


--
-- Name: m_customer_master m_customer_master_customer_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_customer_master
    ADD CONSTRAINT m_customer_master_customer_code_key UNIQUE (customer_code);


--
-- Name: m_customer_master m_customer_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_customer_master
    ADD CONSTRAINT m_customer_master_pkey PRIMARY KEY (id);


--
-- Name: m_emp_experience m_emp_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_experience
    ADD CONSTRAINT m_emp_experience_pkey PRIMARY KEY (id);


--
-- Name: m_emp_family m_emp_family_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_family
    ADD CONSTRAINT m_emp_family_pkey PRIMARY KEY (id);


--
-- Name: m_emp_off_det m_emp_off_det_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_off_det
    ADD CONSTRAINT m_emp_off_det_pkey PRIMARY KEY (empid);


--
-- Name: m_emp_qualification m_emp_qualification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_qualification
    ADD CONSTRAINT m_emp_qualification_pkey PRIMARY KEY (id);


--
-- Name: m_emp_sal_det m_emp_sal_det_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_sal_det
    ADD CONSTRAINT m_emp_sal_det_pkey PRIMARY KEY (empid);


--
-- Name: m_emp_salary m_emp_salary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_salary
    ADD CONSTRAINT m_emp_salary_pkey PRIMARY KEY (empid);


--
-- Name: m_engineering_settings m_engineering_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_engineering_settings
    ADD CONSTRAINT m_engineering_settings_key_key UNIQUE (key);


--
-- Name: m_engineering_settings m_engineering_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_engineering_settings
    ADD CONSTRAINT m_engineering_settings_pkey PRIMARY KEY (id);


--
-- Name: m_grn m_grn_grn_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_grn_no_key UNIQUE (grn_no);


--
-- Name: m_grn m_grn_grn_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_grn_no_key1 UNIQUE (grn_no);


--
-- Name: m_grn m_grn_grn_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_grn_no_key2 UNIQUE (grn_no);


--
-- Name: m_grn m_grn_grn_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_grn_no_key3 UNIQUE (grn_no);


--
-- Name: m_grn_item m_grn_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn_item
    ADD CONSTRAINT m_grn_item_pkey PRIMARY KEY (id);


--
-- Name: m_grn m_grn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_pkey PRIMARY KEY (id);


--
-- Name: m_item_batch m_item_batch_batch_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_batch
    ADD CONSTRAINT m_item_batch_batch_no_key UNIQUE (batch_no);


--
-- Name: m_item_batch m_item_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_batch
    ADD CONSTRAINT m_item_batch_pkey PRIMARY KEY (id);


--
-- Name: m_item_group m_item_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_group
    ADD CONSTRAINT m_item_group_name_key UNIQUE (name);


--
-- Name: m_item_group m_item_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_group
    ADD CONSTRAINT m_item_group_pkey PRIMARY KEY (id);


--
-- Name: m_item_master m_item_master_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_item_code_key UNIQUE (item_code);


--
-- Name: m_item_master m_item_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_pkey PRIMARY KEY (id);


--
-- Name: m_item_subgroup m_item_subgroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subgroup
    ADD CONSTRAINT m_item_subgroup_pkey PRIMARY KEY (id);


--
-- Name: m_item_subtype m_item_subtype_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subtype
    ADD CONSTRAINT m_item_subtype_pkey PRIMARY KEY (id);


--
-- Name: m_item_type m_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_type
    ADD CONSTRAINT m_item_type_pkey PRIMARY KEY (id);


--
-- Name: m_maintenance_asset m_maintenance_asset_asset_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_asset
    ADD CONSTRAINT m_maintenance_asset_asset_code_key UNIQUE (asset_code);


--
-- Name: m_maintenance_asset m_maintenance_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_asset
    ADD CONSTRAINT m_maintenance_asset_pkey PRIMARY KEY (id);


--
-- Name: m_maintenance_machine m_maintenance_machine_machine_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_machine
    ADD CONSTRAINT m_maintenance_machine_machine_code_key UNIQUE (machine_code);


--
-- Name: m_maintenance_machine m_maintenance_machine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_machine
    ADD CONSTRAINT m_maintenance_machine_pkey PRIMARY KEY (id);


--
-- Name: m_maintenance_settings m_maintenance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_settings
    ADD CONSTRAINT m_maintenance_settings_pkey PRIMARY KEY (id);


--
-- Name: m_maintenance_settings m_maintenance_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_maintenance_settings
    ADD CONSTRAINT m_maintenance_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: m_marketing_settings m_marketing_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_marketing_settings
    ADD CONSTRAINT m_marketing_settings_key_key UNIQUE (key);


--
-- Name: m_marketing_settings m_marketing_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_marketing_settings
    ADD CONSTRAINT m_marketing_settings_pkey PRIMARY KEY (id);


--
-- Name: m_party_master m_party_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_pkey PRIMARY KEY (id);


--
-- Name: m_party_master m_party_master_supplier_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key1 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key10 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key100 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key101 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key102 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key103 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key104 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key105 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key106 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key107 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key108 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key109 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key11 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key110 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key111 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key112 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key113 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key114 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key115 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key116 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key117 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key118 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key119 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key12 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key120 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key121 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key122 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key123 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key124 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key125 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key126 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key127 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key128 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key129 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key13 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key130 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key131 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key132 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key133 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key134 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key135 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key136 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key137 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key138 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key139 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key14 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key140 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key141 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key142 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key143 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key144 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key145 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key146 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key147 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key148 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key149 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key15 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key150 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key151 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key152 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key153 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key154 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key155 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key156 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key157 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key158 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key159 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key16 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key160 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key161 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key162 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key163 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key164 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key165 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key166 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key167 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key168 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key169 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key17 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key170 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key171 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key172 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key173 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key174 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key175; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key175 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key176; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key176 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key177; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key177 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key178; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key178 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key179; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key179 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key18 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key180; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key180 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key181; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key181 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key182; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key182 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key183; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key183 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key184; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key184 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key185 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key186; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key186 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key187; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key187 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key188; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key188 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key189; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key189 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key19 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key190; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key190 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key191 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key192; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key192 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key193 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key194; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key194 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key195; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key195 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key196 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key197 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key198; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key198 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key199; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key199 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key2 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key20 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key200; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key200 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key201; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key201 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key202; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key202 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key203; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key203 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key204; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key204 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key205; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key205 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key206; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key206 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key207 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key208; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key208 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key209; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key209 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key21 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key210; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key210 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key211; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key211 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key212; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key212 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key213; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key213 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key214 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key215; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key215 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key216; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key216 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key217; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key217 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key218; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key218 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key219; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key219 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key22 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key23 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key24 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key25 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key26 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key27 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key28 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key29 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key3 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key30 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key31 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key32 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key33 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key34 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key35 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key36 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key37 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key38 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key39 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key4 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key40 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key41 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key42 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key43 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key44 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key45 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key46 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key47 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key48 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key49 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key5 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key50 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key51 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key52 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key53 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key54 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key55 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key56 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key57 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key58 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key59 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key6 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key60 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key61 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key62 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key63 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key64 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key65 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key66 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key67 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key68 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key69 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key7 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key70 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key71 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key72 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key73 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key74 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key75 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key76 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key77 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key78 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key79 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key8 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key80 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key81 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key82 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key83 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key84 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key85 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key86 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key87 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key88 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key89 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key9 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key90 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key91 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key92 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key93 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key94 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key95 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key96 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key97 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key98 UNIQUE (supplier_code);


--
-- Name: m_party_master m_party_master_supplier_code_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_party_master
    ADD CONSTRAINT m_party_master_supplier_code_key99 UNIQUE (supplier_code);


--
-- Name: m_planning_settings m_planning_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_planning_settings
    ADD CONSTRAINT m_planning_settings_pkey PRIMARY KEY (id);


--
-- Name: m_planning_settings m_planning_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_planning_settings
    ADD CONSTRAINT m_planning_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: m_product_category m_product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_category
    ADD CONSTRAINT m_product_category_pkey PRIMARY KEY (id);


--
-- Name: m_product_item_master m_product_item_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_item_master
    ADD CONSTRAINT m_product_item_master_pkey PRIMARY KEY (id);


--
-- Name: m_product_master m_product_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_pkey PRIMARY KEY (id);


--
-- Name: m_product_master m_product_master_product_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key1 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key10 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key11 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key12 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key13 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key14 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key15 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key16 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key17 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key18 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key19 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key2 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key20 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key21 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key22 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key23 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key24 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key25 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key26 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key27 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key28 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key29 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key3 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key4 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key5 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key6 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key7 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key8 UNIQUE (product_uid);


--
-- Name: m_product_master m_product_master_product_uid_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_master
    ADD CONSTRAINT m_product_master_product_uid_key9 UNIQUE (product_uid);


--
-- Name: m_production_machine m_production_machine_machine_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_machine
    ADD CONSTRAINT m_production_machine_machine_code_key UNIQUE (machine_code);


--
-- Name: m_production_machine m_production_machine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_machine
    ADD CONSTRAINT m_production_machine_pkey PRIMARY KEY (id);


--
-- Name: m_production_settings m_production_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_settings
    ADD CONSTRAINT m_production_settings_key_key UNIQUE (key);


--
-- Name: m_production_settings m_production_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_production_settings
    ADD CONSTRAINT m_production_settings_pkey PRIMARY KEY (id);


--
-- Name: m_purchase_order_item m_purchase_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order_item
    ADD CONSTRAINT m_purchase_order_item_pkey PRIMARY KEY (id);


--
-- Name: m_purchase_order m_purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order
    ADD CONSTRAINT m_purchase_order_pkey PRIMARY KEY (id);


--
-- Name: m_purchase_order m_purchase_order_po_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order
    ADD CONSTRAINT m_purchase_order_po_no_key UNIQUE (po_no);


--
-- Name: m_purchase_order m_purchase_order_po_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order
    ADD CONSTRAINT m_purchase_order_po_no_key1 UNIQUE (po_no);


--
-- Name: m_purchase_order m_purchase_order_po_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order
    ADD CONSTRAINT m_purchase_order_po_no_key2 UNIQUE (po_no);


--
-- Name: m_purchase_order m_purchase_order_po_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order
    ADD CONSTRAINT m_purchase_order_po_no_key3 UNIQUE (po_no);


--
-- Name: m_purchase_requisition_item m_purchase_requisition_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition_item
    ADD CONSTRAINT m_purchase_requisition_item_pkey PRIMARY KEY (id);


--
-- Name: m_purchase_requisition m_purchase_requisition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition
    ADD CONSTRAINT m_purchase_requisition_pkey PRIMARY KEY (id);


--
-- Name: m_purchase_requisition m_purchase_requisition_req_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition
    ADD CONSTRAINT m_purchase_requisition_req_no_key UNIQUE (req_no);


--
-- Name: m_purchase_requisition m_purchase_requisition_req_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition
    ADD CONSTRAINT m_purchase_requisition_req_no_key1 UNIQUE (req_no);


--
-- Name: m_purchase_requisition m_purchase_requisition_req_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition
    ADD CONSTRAINT m_purchase_requisition_req_no_key2 UNIQUE (req_no);


--
-- Name: m_purchase_requisition m_purchase_requisition_req_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition
    ADD CONSTRAINT m_purchase_requisition_req_no_key3 UNIQUE (req_no);


--
-- Name: m_purchase_settings m_purchase_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_settings
    ADD CONSTRAINT m_purchase_settings_pkey PRIMARY KEY (id);


--
-- Name: m_quality_settings m_quality_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_quality_settings
    ADD CONSTRAINT m_quality_settings_key_key UNIQUE (key);


--
-- Name: m_quality_settings m_quality_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_quality_settings
    ADD CONSTRAINT m_quality_settings_pkey PRIMARY KEY (id);


--
-- Name: m_rack m_rack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rack
    ADD CONSTRAINT m_rack_pkey PRIMARY KEY (id);


--
-- Name: m_rack m_rack_rack_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rack
    ADD CONSTRAINT m_rack_rack_code_key UNIQUE (rack_code);


--
-- Name: m_rfq_item m_rfq_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_item
    ADD CONSTRAINT m_rfq_item_pkey PRIMARY KEY (id);


--
-- Name: m_rfq m_rfq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq
    ADD CONSTRAINT m_rfq_pkey PRIMARY KEY (id);


--
-- Name: m_rfq m_rfq_rfq_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq
    ADD CONSTRAINT m_rfq_rfq_no_key UNIQUE (rfq_no);


--
-- Name: m_rfq m_rfq_rfq_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq
    ADD CONSTRAINT m_rfq_rfq_no_key1 UNIQUE (rfq_no);


--
-- Name: m_rfq m_rfq_rfq_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq
    ADD CONSTRAINT m_rfq_rfq_no_key2 UNIQUE (rfq_no);


--
-- Name: m_rfq m_rfq_rfq_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq
    ADD CONSTRAINT m_rfq_rfq_no_key3 UNIQUE (rfq_no);


--
-- Name: m_rfq_vendor m_rfq_vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_vendor
    ADD CONSTRAINT m_rfq_vendor_pkey PRIMARY KEY (id);


--
-- Name: m_stores_settings m_stores_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_stores_settings
    ADD CONSTRAINT m_stores_settings_pkey PRIMARY KEY (id);


--
-- Name: m_subcontract_settings m_subcontract_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_subcontract_settings
    ADD CONSTRAINT m_subcontract_settings_pkey PRIMARY KEY (id);


--
-- Name: m_subcontract_settings m_subcontract_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_subcontract_settings
    ADD CONSTRAINT m_subcontract_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: m_supplier_master m_supplier_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_pkey PRIMARY KEY (id);


--
-- Name: m_supplier_master m_supplier_master_supplier_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_supplier_code_key UNIQUE (supplier_code);


--
-- Name: m_supplier_master m_supplier_master_supplier_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_supplier_code_key1 UNIQUE (supplier_code);


--
-- Name: m_supplier_master m_supplier_master_supplier_code_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_supplier_code_key2 UNIQUE (supplier_code);


--
-- Name: m_supplier_master m_supplier_master_supplier_code_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_supplier_code_key3 UNIQUE (supplier_code);


--
-- Name: m_supplier_master m_supplier_master_supplier_code_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_supplier_master
    ADD CONSTRAINT m_supplier_master_supplier_code_key4 UNIQUE (supplier_code);


--
-- Name: m_unit m_unit_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key UNIQUE (name);


--
-- Name: m_unit m_unit_name_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key1 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key10 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key100 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key101 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key102 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key103 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key104 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key105 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key106 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key107 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key108 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key109 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key11 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key110 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key111 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key112 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key113 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key114 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key115 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key116 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key117 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key118 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key119 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key12 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key120 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key121 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key122 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key123 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key124 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key125 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key126 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key127 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key128 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key129 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key13 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key130 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key131 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key132 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key133 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key134 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key135 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key136 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key137 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key138 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key139 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key14 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key140 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key141 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key142 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key143 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key144 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key145 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key146 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key147 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key148 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key149 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key15 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key150 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key151 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key152 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key153 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key154 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key155 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key156 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key157 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key158 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key159 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key16 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key160 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key161 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key162 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key163 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key164 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key165 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key166 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key167 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key168 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key169 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key17 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key170 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key171 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key172 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key173 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key174 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key175; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key175 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key176; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key176 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key177; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key177 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key178; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key178 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key179; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key179 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key18 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key180; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key180 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key181; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key181 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key182; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key182 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key183; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key183 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key184; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key184 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key185 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key186; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key186 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key187; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key187 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key188; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key188 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key189; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key189 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key19 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key190; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key190 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key191 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key192; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key192 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key193 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key194; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key194 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key195; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key195 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key196 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key197 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key198; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key198 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key199; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key199 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key2 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key20 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key200; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key200 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key201; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key201 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key202; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key202 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key203; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key203 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key204; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key204 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key205; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key205 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key206; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key206 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key207 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key208; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key208 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key209; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key209 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key21 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key210; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key210 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key211; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key211 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key212; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key212 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key213; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key213 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key214 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key215; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key215 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key216; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key216 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key217; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key217 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key218; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key218 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key219; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key219 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key22 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key220; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key220 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key221; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key221 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key222; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key222 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key223; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key223 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key224; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key224 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key23 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key24 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key25 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key26 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key27 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key28 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key29 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key3 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key30 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key31 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key32 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key33 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key34 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key35 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key36 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key37 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key38 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key39 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key4 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key40 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key41 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key42 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key43 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key44 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key45 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key46 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key47 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key48 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key49 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key5 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key50 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key51 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key52 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key53 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key54 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key55 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key56 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key57 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key58 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key59 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key6 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key60 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key61 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key62 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key63 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key64 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key65 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key66 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key67 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key68 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key69 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key7 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key70 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key71 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key72 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key73 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key74 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key75 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key76 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key77 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key78 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key79 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key8 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key80 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key81 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key82 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key83 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key84 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key85 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key86 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key87 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key88 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key89 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key9 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key90 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key91 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key92 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key93 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key94 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key95 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key96 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key97 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key98 UNIQUE (name);


--
-- Name: m_unit m_unit_name_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_name_key99 UNIQUE (name);


--
-- Name: m_unit m_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_unit
    ADD CONSTRAINT m_unit_pkey PRIMARY KEY (id);


--
-- Name: m_vendor_price_list m_vendor_price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_vendor_price_list
    ADD CONSTRAINT m_vendor_price_list_pkey PRIMARY KEY (id);


--
-- Name: m_vendor_rating m_vendor_rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_vendor_rating
    ADD CONSTRAINT m_vendor_rating_pkey PRIMARY KEY (id);


--
-- Name: muster_roll_summary muster_roll_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.muster_roll_summary
    ADD CONSTRAINT muster_roll_summary_pkey PRIMARY KEY (empid, year, month);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onduty_permission onduty_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onduty_permission
    ADD CONSTRAINT onduty_permission_pkey PRIMARY KEY (movement_id);


--
-- Name: profile_update_requests profile_update_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_update_requests
    ADD CONSTRAINT profile_update_requests_pkey PRIMARY KEY (id);


--
-- Name: salary_register salary_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_register
    ADD CONSTRAINT salary_register_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: shift_change shift_change_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_change
    ADD CONSTRAINT shift_change_pkey PRIMARY KEY (schange_no);


--
-- Name: shift_master shift_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_master
    ADD CONSTRAINT shift_master_pkey PRIMARY KEY (shift_id);


--
-- Name: shift_schedule shift_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_schedule
    ADD CONSTRAINT shift_schedule_pkey PRIMARY KEY (id);


--
-- Name: t_appraisal_cycle t_appraisal_cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal_cycle
    ADD CONSTRAINT t_appraisal_cycle_pkey PRIMARY KEY (id);


--
-- Name: t_appraisal t_appraisal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal
    ADD CONSTRAINT t_appraisal_pkey PRIMARY KEY (id);


--
-- Name: t_appraisal_rating t_appraisal_rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_appraisal_rating
    ADD CONSTRAINT t_appraisal_rating_pkey PRIMARY KEY (id);


--
-- Name: t_attendance_raw_punch t_attendance_raw_punch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_attendance_raw_punch
    ADD CONSTRAINT t_attendance_raw_punch_pkey PRIMARY KEY (id);


--
-- Name: t_bom t_bom_bom_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key1 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key10 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key11 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key12 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key13 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key14 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key15 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key16 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key17 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key18 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key19 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key2 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key20 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key21 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key22 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key23 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key24 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key25 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key26 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key27 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key28 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key29 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key3 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key30 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key31 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key32 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key33 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key34 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key35 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key36 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key4 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key5 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key6 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key7 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key8 UNIQUE (bom_no);


--
-- Name: t_bom t_bom_bom_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_bom_no_key9 UNIQUE (bom_no);


--
-- Name: t_bom_item t_bom_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom_item
    ADD CONSTRAINT t_bom_item_pkey PRIMARY KEY (id);


--
-- Name: t_bom t_bom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom
    ADD CONSTRAINT t_bom_pkey PRIMARY KEY (id);


--
-- Name: t_candidate t_candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_candidate
    ADD CONSTRAINT t_candidate_pkey PRIMARY KEY (id);


--
-- Name: t_certification t_certification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_certification
    ADD CONSTRAINT t_certification_pkey PRIMARY KEY (id);


--
-- Name: t_delivery_challan t_delivery_challan_dc_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan
    ADD CONSTRAINT t_delivery_challan_dc_no_key UNIQUE (dc_no);


--
-- Name: t_delivery_challan_item t_delivery_challan_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan_item
    ADD CONSTRAINT t_delivery_challan_item_pkey PRIMARY KEY (id);


--
-- Name: t_delivery_challan t_delivery_challan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan
    ADD CONSTRAINT t_delivery_challan_pkey PRIMARY KEY (id);


--
-- Name: t_disciplinary_action t_disciplinary_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_action
    ADD CONSTRAINT t_disciplinary_action_pkey PRIMARY KEY (id);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key1 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key10 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key11 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key12 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key13 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key14 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key15 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key16 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key17 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key18 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key19 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key2 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key20 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key21 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key22 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key23 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key24 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key25 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key26 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key27 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key28 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key29 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key3 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key30 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key31 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key32 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key33 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key34 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key35 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key36 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key37 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key38 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key39 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key4 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key40 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key41 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key42 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key43 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key44 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key45 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key46 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key47 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key48 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key49 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key5 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key50 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key51 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key52 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key53 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key54 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key55 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key56 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key57 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key58 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key59 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key6 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key60 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key61 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key62 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key63 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key64 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key65 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key66 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key67 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key68 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key69 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key7 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key70 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key71 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key72 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key73 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key74 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key75 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key76 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key77 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key78 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key79 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key8 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key80 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key81 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key82 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key83 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key84 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key85 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key86 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key87 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key88 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key89 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key9 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key90 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key91 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key92 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_case_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_case_no_key93 UNIQUE (case_no);


--
-- Name: t_disciplinary_case t_disciplinary_case_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_disciplinary_case
    ADD CONSTRAINT t_disciplinary_case_pkey PRIMARY KEY (id);


--
-- Name: t_emp_tax_computation t_emp_tax_computation_empid_financial_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_computation
    ADD CONSTRAINT t_emp_tax_computation_empid_financial_year_key UNIQUE (empid, financial_year);


--
-- Name: t_emp_tax_computation t_emp_tax_computation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_computation
    ADD CONSTRAINT t_emp_tax_computation_pkey PRIMARY KEY (id);


--
-- Name: t_emp_tax_investment t_emp_tax_investment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_investment
    ADD CONSTRAINT t_emp_tax_investment_pkey PRIMARY KEY (id);


--
-- Name: t_emp_tax_regime t_emp_tax_regime_empid_financial_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_regime
    ADD CONSTRAINT t_emp_tax_regime_empid_financial_year_key UNIQUE (empid, financial_year);


--
-- Name: t_emp_tax_regime t_emp_tax_regime_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_regime
    ADD CONSTRAINT t_emp_tax_regime_pkey PRIMARY KEY (id);


--
-- Name: t_exit_application t_exit_application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_exit_application
    ADD CONSTRAINT t_exit_application_pkey PRIMARY KEY (id);


--
-- Name: t_exit_clearance t_exit_clearance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_exit_clearance
    ADD CONSTRAINT t_exit_clearance_pkey PRIMARY KEY (id);


--
-- Name: t_final_settlement t_final_settlement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_final_settlement
    ADD CONSTRAINT t_final_settlement_pkey PRIMARY KEY (id);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key1 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key10 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key11 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key12 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key13 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key14 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key15 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key16 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key17 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key18 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key19 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key2 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key20 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key21 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key22 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key23 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key24 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key25 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key26 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key3 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key4 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key5 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key6 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key7 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key8 UNIQUE (entry_no);


--
-- Name: t_gate_entry t_gate_entry_entry_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_entry_no_key9 UNIQUE (entry_no);


--
-- Name: t_gate_entry_item t_gate_entry_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry_item
    ADD CONSTRAINT t_gate_entry_item_pkey PRIMARY KEY (id);


--
-- Name: t_gate_entry t_gate_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry
    ADD CONSTRAINT t_gate_entry_pkey PRIMARY KEY (id);


--
-- Name: t_ir t_grn_grn_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key1 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key10 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key100 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key101 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key102 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key103 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key104 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key105 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key106 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key107 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key108 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key109 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key11 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key110 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key111 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key112 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key113 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key114 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key115 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key116 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key117 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key118 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key119 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key12 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key120 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key121 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key122 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key123 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key124 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key125 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key126 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key127 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key128 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key129 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key13 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key130 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key131 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key132 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key133 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key134 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key135 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key136 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key137 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key138 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key139 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key14 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key140 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key141 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key142 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key143 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key144 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key145 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key146 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key147 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key148 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key149 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key15 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key150 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key151 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key152 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key153 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key154 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key155 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key156 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key157 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key158 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key159 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key16 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key160 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key161 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key162 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key163 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key164 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key165 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key166 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key167 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key168 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key169 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key17 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key170 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key171 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key172 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key173 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key174 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key175; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key175 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key176; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key176 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key177; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key177 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key178; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key178 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key179; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key179 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key18 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key180; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key180 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key181; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key181 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key182; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key182 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key183; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key183 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key184; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key184 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key185 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key186; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key186 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key187; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key187 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key188; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key188 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key189; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key189 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key19 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key190; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key190 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key191 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key192; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key192 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key193 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key194; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key194 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key195; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key195 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key196 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key197 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key198; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key198 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key199; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key199 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key2 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key20 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key200; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key200 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key201; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key201 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key202; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key202 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key203; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key203 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key204; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key204 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key205; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key205 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key206; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key206 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key207 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key208; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key208 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key209; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key209 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key21 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key210; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key210 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key211; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key211 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key212; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key212 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key213; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key213 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key214 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key215; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key215 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key216; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key216 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key217; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key217 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key218; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key218 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key219; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key219 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key22 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key220; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key220 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key23 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key24 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key25 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key26 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key27 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key28 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key29 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key3 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key30 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key31 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key32 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key33 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key34 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key35 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key36 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key37 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key38 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key39 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key4 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key40 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key41 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key42 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key43 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key44 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key45 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key46 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key47 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key48 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key49 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key5 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key50 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key51 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key52 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key53 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key54 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key55 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key56 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key57 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key58 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key59 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key6 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key60 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key61 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key62 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key63 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key64 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key65 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key66 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key67 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key68 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key69 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key7 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key70 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key71 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key72 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key73 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key74 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key75 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key76 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key77 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key78 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key79 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key8 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key80 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key81 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key82 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key83 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key84 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key85 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key86 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key87 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key88 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key89 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key9 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key90 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key91 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key92 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key93 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key94 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key95 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key96 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key97 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key98 UNIQUE (grn_no);


--
-- Name: t_ir t_grn_grn_no_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_grn_no_key99 UNIQUE (grn_no);


--
-- Name: t_ir_item t_grn_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir_item
    ADD CONSTRAINT t_grn_item_pkey PRIMARY KEY (id);


--
-- Name: t_ir t_grn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_pkey PRIMARY KEY (id);


--
-- Name: t_interview t_interview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_interview
    ADD CONSTRAINT t_interview_pkey PRIMARY KEY (id);


--
-- Name: t_invoice t_invoice_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice
    ADD CONSTRAINT t_invoice_invoice_no_key UNIQUE (invoice_no);


--
-- Name: t_invoice_item t_invoice_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice_item
    ADD CONSTRAINT t_invoice_item_pkey PRIMARY KEY (id);


--
-- Name: t_invoice t_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice
    ADD CONSTRAINT t_invoice_pkey PRIMARY KEY (id);


--
-- Name: t_job_requisition t_job_requisition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_pkey PRIMARY KEY (id);


--
-- Name: t_job_requisition t_job_requisition_req_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key1 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key10 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key11 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key12 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key13 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key14 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key15 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key16 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key17 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key18 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key19 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key2 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key20 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key21 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key22 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key23 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key24 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key25 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key26 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key27 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key28 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key29 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key3 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key30 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key31 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key32 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key33 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key34 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key35 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key36 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key37 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key38 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key39 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key4 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key40 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key41 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key42 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key43 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key44 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key45 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key46 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key47 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key48 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key49 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key5 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key50 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key51 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key52 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key53 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key54 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key55 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key56 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key57 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key58 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key59 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key6 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key60 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key61 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key62 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key63 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key64 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key65 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key66 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key67 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key68 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key69 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key7 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key70 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key71 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key72 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key8 UNIQUE (req_no);


--
-- Name: t_job_requisition t_job_requisition_req_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_job_requisition
    ADD CONSTRAINT t_job_requisition_req_no_key9 UNIQUE (req_no);


--
-- Name: t_kra_template_item t_kra_template_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_kra_template_item
    ADD CONSTRAINT t_kra_template_item_pkey PRIMARY KEY (id);


--
-- Name: t_kra_template t_kra_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_kra_template
    ADD CONSTRAINT t_kra_template_pkey PRIMARY KEY (id);


--
-- Name: t_leads t_leads_lead_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_leads
    ADD CONSTRAINT t_leads_lead_no_key UNIQUE (lead_no);


--
-- Name: t_leads t_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_leads
    ADD CONSTRAINT t_leads_pkey PRIMARY KEY (id);


--
-- Name: t_maintenance_schedule t_maintenance_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_maintenance_schedule
    ADD CONSTRAINT t_maintenance_schedule_pkey PRIMARY KEY (id);


--
-- Name: t_maintenance_schedule t_maintenance_schedule_schedule_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_maintenance_schedule
    ADD CONSTRAINT t_maintenance_schedule_schedule_no_key UNIQUE (schedule_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key1 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key10 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key11 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key12 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key13 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key14 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key15 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key16 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key17 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key18 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key19 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key2 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key20 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key21 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key22 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key23 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key24 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key25 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key26 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key27 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key28 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key29 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key3 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key30 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key31 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key32 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key33 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key34 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key35 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key36 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key37 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key38 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key39 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key4 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key40 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key41 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key42 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key43 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key44 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key45 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key46 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key47 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key48 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key49 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key5 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key50 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key51 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key52 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key53 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key54 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key55 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key56 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key57 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key58 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key59 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key6 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key60 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key61 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key62 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key63 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key64 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key65 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key66 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key67 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key7 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key8 UNIQUE (issue_no);


--
-- Name: t_material_issue t_material_issue_issue_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_issue_no_key9 UNIQUE (issue_no);


--
-- Name: t_material_issue_item t_material_issue_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue_item
    ADD CONSTRAINT t_material_issue_item_pkey PRIMARY KEY (id);


--
-- Name: t_material_issue t_material_issue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_pkey PRIMARY KEY (id);


--
-- Name: t_material_requisition_item t_material_requisition_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition_item
    ADD CONSTRAINT t_material_requisition_item_pkey PRIMARY KEY (id);


--
-- Name: t_material_requisition t_material_requisition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_pkey PRIMARY KEY (id);


--
-- Name: t_material_requisition t_material_requisition_req_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key1 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key10 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key100 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key101 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key102 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key103 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key104 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key105 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key106 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key107 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key108 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key109 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key11 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key110 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key111 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key112 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key113 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key114 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key115 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key116 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key117 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key118 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key119 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key12 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key120 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key121 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key122 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key123 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key124 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key125 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key126 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key127 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key128 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key129 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key13 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key130 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key131 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key132 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key133 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key134 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key135 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key136 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key137 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key138 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key139 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key14 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key140 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key141 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key142 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key143 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key144 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key145 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key146 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key147 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key148 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key149 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key15 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key150 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key151 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key152 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key153 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key154 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key155 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key156 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key157 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key158 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key159 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key16 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key160 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key161 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key162 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key163 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key164 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key165 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key166 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key167 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key168 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key169 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key17 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key170 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key171 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key172 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key173 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key174 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key18 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key19 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key2 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key20 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key21 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key22 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key23 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key24 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key25 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key26 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key27 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key28 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key29 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key3 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key30 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key31 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key32 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key33 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key34 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key35 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key36 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key37 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key38 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key39 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key4 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key40 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key41 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key42 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key43 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key44 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key45 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key46 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key47 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key48 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key49 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key5 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key50 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key51 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key52 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key53 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key54 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key55 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key56 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key57 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key58 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key59 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key6 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key60 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key61 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key62 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key63 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key64 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key65 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key66 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key67 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key68 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key69 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key7 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key70 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key71 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key72 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key73 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key74 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key75 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key76 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key77 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key78 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key79 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key8 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key80 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key81 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key82 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key83 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key84 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key85 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key86 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key87 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key88 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key89 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key9 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key90 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key91 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key92 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key93 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key94 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key95 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key96 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key97 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key98 UNIQUE (req_no);


--
-- Name: t_material_requisition t_material_requisition_req_no_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition
    ADD CONSTRAINT t_material_requisition_req_no_key99 UNIQUE (req_no);


--
-- Name: t_material_return_item t_material_return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return_item
    ADD CONSTRAINT t_material_return_item_pkey PRIMARY KEY (id);


--
-- Name: t_material_return t_material_return_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_pkey PRIMARY KEY (id);


--
-- Name: t_material_return t_material_return_return_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key1 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key10 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key11 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key12 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key13 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key14 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key15 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key16 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key17 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key18 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key19 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key2 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key20 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key21 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key22 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key23 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key24 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key25 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key26 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key3 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key4 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key5 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key6 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key7 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key8 UNIQUE (return_no);


--
-- Name: t_material_return t_material_return_return_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return
    ADD CONSTRAINT t_material_return_return_no_key9 UNIQUE (return_no);


--
-- Name: t_non_conformance t_non_conformance_nc_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_non_conformance
    ADD CONSTRAINT t_non_conformance_nc_no_key UNIQUE (nc_no);


--
-- Name: t_non_conformance t_non_conformance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_non_conformance
    ADD CONSTRAINT t_non_conformance_pkey PRIMARY KEY (id);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key1 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key10 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key11 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key12 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key13 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key14 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key15 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key16 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key17 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key18 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key19 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key2 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key20 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key21 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key22 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key23 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key24 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key25 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key26 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key27 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key28 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key29 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key3 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key30 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key31 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key32 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key33 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key34 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key35 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key36 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key37 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key38 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key39 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key4 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key40 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key41 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key42 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key43 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key44 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key45 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key46 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key47 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key48 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key49 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key5 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key50 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key51 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key52 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key53 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key54 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key55 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key56 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key57 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key58 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key59 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key6 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key60 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key61 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key62 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key63 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key64 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key65 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key66 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key67 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key68 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key69 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key7 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key70 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key71 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key8 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_offer_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_offer_no_key9 UNIQUE (offer_no);


--
-- Name: t_offer_letter t_offer_letter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_offer_letter
    ADD CONSTRAINT t_offer_letter_pkey PRIMARY KEY (id);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key1 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key10 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key11 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key12 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key13 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key14 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key15 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key16 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key17 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key18 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key19 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key2 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key20 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key21 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key22 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key23 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key24 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key25 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key26 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key27 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key28 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key29 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key3 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key30 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key31 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key32 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key33 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key34 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key35 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key36 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key37 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key38 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key39 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key4 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key40 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key41 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key42 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key43 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key44 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key45 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key46 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key47 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key48 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key49 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key5 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key50 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key51 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key52 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key53 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key6 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key7 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key8 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_challan_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_challan_no_key9 UNIQUE (challan_no);


--
-- Name: t_pf_challan t_pf_challan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_challan
    ADD CONSTRAINT t_pf_challan_pkey PRIMARY KEY (id);


--
-- Name: t_pf_ledger t_pf_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pf_ledger
    ADD CONSTRAINT t_pf_ledger_pkey PRIMARY KEY (id);


--
-- Name: t_planning_capacity t_planning_capacity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_capacity
    ADD CONSTRAINT t_planning_capacity_pkey PRIMARY KEY (id);


--
-- Name: t_planning_capacity t_planning_capacity_plan_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_capacity
    ADD CONSTRAINT t_planning_capacity_plan_no_key UNIQUE (plan_no);


--
-- Name: t_planning_mrp t_planning_mrp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_mrp
    ADD CONSTRAINT t_planning_mrp_pkey PRIMARY KEY (id);


--
-- Name: t_planning_schedule t_planning_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_schedule
    ADD CONSTRAINT t_planning_schedule_pkey PRIMARY KEY (id);


--
-- Name: t_planning_schedule t_planning_schedule_schedule_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_planning_schedule
    ADD CONSTRAINT t_planning_schedule_schedule_no_key UNIQUE (schedule_no);


--
-- Name: t_pr_amendment t_pr_amendment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_amendment
    ADD CONSTRAINT t_pr_amendment_pkey PRIMARY KEY (id);


--
-- Name: t_pr_sanction t_pr_sanction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_sanction
    ADD CONSTRAINT t_pr_sanction_pkey PRIMARY KEY (id);


--
-- Name: t_production_daily_entry t_production_daily_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_daily_entry
    ADD CONSTRAINT t_production_daily_entry_pkey PRIMARY KEY (id);


--
-- Name: t_production_downtime t_production_downtime_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_downtime
    ADD CONSTRAINT t_production_downtime_pkey PRIMARY KEY (id);


--
-- Name: t_production_order_item t_production_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order_item
    ADD CONSTRAINT t_production_order_item_pkey PRIMARY KEY (id);


--
-- Name: t_production_order t_production_order_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key1 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key10 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key11 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key12 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key13 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key14 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key15 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key16 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key17 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key18 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key19 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key2 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key20 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key21 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key22 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key23 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key24 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key25 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key26 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key27 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key28 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key29 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key3 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key30 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key31 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key32 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key4 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key5 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key6 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key7 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key8 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_order_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_order_no_key9 UNIQUE (order_no);


--
-- Name: t_production_order t_production_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order
    ADD CONSTRAINT t_production_order_pkey PRIMARY KEY (id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key1 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key10 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key11 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key12 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key13 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key14 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key15 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key16 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key17 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key18 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key19 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key2 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key20 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key21 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key22 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key23 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key24 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key25 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key26 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key27 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key28 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key29 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key3 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key30 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key31 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key32 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key33 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key34 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key35 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key36 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key37 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key38 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key39 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key4 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key40 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key41 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key42 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key43 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key44 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key45 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key46 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key47 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key48 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key49 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key5 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key50 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key51 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key52 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key53 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key54 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key55 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key56 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key57 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key58 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key59 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key6 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key60 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key61 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key62 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key63 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key64 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key65 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key66 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key67 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key68 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key69 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key7 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key70 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key71 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key72 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key73 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key74 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key75 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key76 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key77 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key78 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key79 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key8 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key80 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key81 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key82 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key83 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key84 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key85 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key86 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key87 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key88 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key89 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key9 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key90 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key91 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key92 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key93 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_batch_id_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_batch_id_key94 UNIQUE (batch_id);


--
-- Name: t_punch_batch t_punch_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_punch_batch
    ADD CONSTRAINT t_punch_batch_pkey PRIMARY KEY (id);


--
-- Name: t_purchase_order_item t_purchase_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order_item
    ADD CONSTRAINT t_purchase_order_item_pkey PRIMARY KEY (id);


--
-- Name: t_purchase_order t_purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_pkey PRIMARY KEY (id);


--
-- Name: t_purchase_order t_purchase_order_po_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key1 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key10 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key100 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key101 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key102 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key103 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key104 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key105 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key106 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key107 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key108 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key109 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key11 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key110 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key111 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key112; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key112 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key113; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key113 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key114; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key114 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key115; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key115 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key116; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key116 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key117; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key117 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key118; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key118 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key119; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key119 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key12 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key120; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key120 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key121; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key121 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key122; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key122 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key123; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key123 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key124 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key125; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key125 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key126 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key127; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key127 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key128; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key128 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key129 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key13 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key130 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key131; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key131 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key132 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key133; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key133 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key134; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key134 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key135; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key135 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key136 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key137; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key137 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key138; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key138 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key139; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key139 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key14 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key140; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key140 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key141 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key142; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key142 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key143; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key143 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key144; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key144 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key145; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key145 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key146; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key146 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key147; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key147 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key148; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key148 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key149; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key149 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key15 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key150; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key150 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key151 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key152; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key152 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key153; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key153 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key154; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key154 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key155; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key155 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key156; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key156 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key157; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key157 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key158 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key159 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key16 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key160; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key160 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key161; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key161 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key162; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key162 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key163; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key163 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key164; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key164 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key165 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key166; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key166 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key167 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key168; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key168 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key169 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key17 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key170; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key170 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key171 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key172; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key172 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key173; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key173 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key174; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key174 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key175; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key175 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key176; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key176 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key177; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key177 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key178; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key178 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key179; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key179 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key18 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key180; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key180 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key181; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key181 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key182; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key182 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key183; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key183 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key184; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key184 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key185 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key186; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key186 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key187; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key187 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key188; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key188 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key189; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key189 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key19 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key190; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key190 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key191 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key192; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key192 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key193 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key194; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key194 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key195; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key195 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key196 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key197 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key198; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key198 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key199; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key199 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key2 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key20 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key200; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key200 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key201; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key201 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key202; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key202 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key203; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key203 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key204; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key204 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key205; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key205 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key206; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key206 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key207 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key208; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key208 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key209; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key209 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key21 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key210; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key210 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key211; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key211 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key212; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key212 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key213; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key213 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key214 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key215; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key215 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key216; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key216 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key217; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key217 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key218; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key218 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key219; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key219 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key22 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key220; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key220 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key23 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key24 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key25 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key26 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key27 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key28 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key29 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key3 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key30 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key31 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key32 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key33 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key34 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key35 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key36 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key37 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key38 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key39 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key4 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key40 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key41 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key42 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key43 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key44 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key45 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key46 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key47 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key48 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key49 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key5 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key50 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key51 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key52 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key53 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key54 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key55 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key56 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key57 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key58 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key59 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key6 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key60 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key61 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key62 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key63 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key64 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key65 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key66 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key67 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key68 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key69 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key7 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key70 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key71 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key72 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key73 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key74 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key75 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key76 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key77 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key78 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key79 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key8 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key80 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key81 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key82 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key83 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key84 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key85 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key86 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key87 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key88 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key89 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key9 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key90 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key91 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key92 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key93 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key94 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key95 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key96 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key97 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key98 UNIQUE (po_no);


--
-- Name: t_purchase_order t_purchase_order_po_no_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_po_no_key99 UNIQUE (po_no);


--
-- Name: t_purchase_requisition_item t_purchase_requisition_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition_item
    ADD CONSTRAINT t_purchase_requisition_item_pkey PRIMARY KEY (id);


--
-- Name: t_purchase_requisition t_purchase_requisition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_pkey PRIMARY KEY (id);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key1 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key10 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key100 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key101 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key102 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key103 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key104 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key105 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key106 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key107 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key108 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key109 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key11 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key110 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key111 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key12 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key13 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key14 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key15 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key16 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key17 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key18 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key19 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key2 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key20 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key21 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key22 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key23 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key24 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key25 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key26 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key27 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key28 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key29 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key3 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key30 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key31 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key32 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key33 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key34 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key35 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key36 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key37 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key38 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key39 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key4 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key40 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key41 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key42 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key43 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key44 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key45 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key46 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key47 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key48 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key49 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key5 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key50 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key51 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key52 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key53 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key54 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key55 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key56 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key57 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key58 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key59 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key6 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key60 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key61 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key62 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key63 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key64 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key65 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key66 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key67 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key68 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key69 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key7 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key70 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key71 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key72 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key73 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key74 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key75 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key76 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key77 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key78 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key79 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key8 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key80 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key81 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key82 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key83 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key84 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key85 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key86 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key87 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key88 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key89 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key9 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key90 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key91 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key92 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key93 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key94 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key95 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key96 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key97 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key98 UNIQUE (req_no);


--
-- Name: t_purchase_requisition t_purchase_requisition_req_no_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition
    ADD CONSTRAINT t_purchase_requisition_req_no_key99 UNIQUE (req_no);


--
-- Name: t_quality_inspection t_quality_inspection_inspection_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection
    ADD CONSTRAINT t_quality_inspection_inspection_no_key UNIQUE (inspection_no);


--
-- Name: t_quality_inspection_items t_quality_inspection_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection_items
    ADD CONSTRAINT t_quality_inspection_items_pkey PRIMARY KEY (id);


--
-- Name: t_quality_inspection t_quality_inspection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection
    ADD CONSTRAINT t_quality_inspection_pkey PRIMARY KEY (id);


--
-- Name: t_quotation_items t_quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotation_items
    ADD CONSTRAINT t_quotation_items_pkey PRIMARY KEY (id);


--
-- Name: t_quotations t_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotations
    ADD CONSTRAINT t_quotations_pkey PRIMARY KEY (id);


--
-- Name: t_quotations t_quotations_quote_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotations
    ADD CONSTRAINT t_quotations_quote_no_key UNIQUE (quote_no);


--
-- Name: t_rfq_item t_rfq_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_item
    ADD CONSTRAINT t_rfq_item_pkey PRIMARY KEY (id);


--
-- Name: t_rfq t_rfq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_pkey PRIMARY KEY (id);


--
-- Name: t_rfq t_rfq_rfq_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key1 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key10 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key100; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key100 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key101; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key101 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key102; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key102 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key103; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key103 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key104; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key104 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key105; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key105 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key106; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key106 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key107 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key108; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key108 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key109; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key109 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key11 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key110 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key111; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key111 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key12 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key13 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key14 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key15 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key16 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key17 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key18 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key19 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key2 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key20 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key21 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key22 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key23 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key24 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key25 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key26 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key27 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key28 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key29 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key3 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key30 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key31 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key32 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key33 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key34 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key35 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key36 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key37 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key38 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key39 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key4 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key40 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key41 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key42 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key43 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key44 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key45 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key46 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key47 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key48 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key49 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key5 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key50 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key51 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key52 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key53 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key54 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key55 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key56 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key57 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key58 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key59 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key6 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key60 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key61 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key62 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key63 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key64 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key65 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key66 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key67 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key68 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key69 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key7 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key70 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key71 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key72 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key73 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key74 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key75 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key76 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key77 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key78 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key79 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key8 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key80 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key81 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key82 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key83 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key84 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key85 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key86 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key87 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key88 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key89 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key9 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key90 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key91; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key91 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key92; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key92 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key93 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key94 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key95; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key95 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key96; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key96 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key97; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key97 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key98 UNIQUE (rfq_no);


--
-- Name: t_rfq t_rfq_rfq_no_key99; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq
    ADD CONSTRAINT t_rfq_rfq_no_key99 UNIQUE (rfq_no);


--
-- Name: t_rfq_vendor t_rfq_vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_vendor
    ADD CONSTRAINT t_rfq_vendor_pkey PRIMARY KEY (id);


--
-- Name: t_sales_order_items t_sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_order_items
    ADD CONSTRAINT t_sales_order_items_pkey PRIMARY KEY (id);


--
-- Name: t_sales_orders t_sales_orders_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_orders
    ADD CONSTRAINT t_sales_orders_order_no_key UNIQUE (order_no);


--
-- Name: t_sales_orders t_sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_orders
    ADD CONSTRAINT t_sales_orders_pkey PRIMARY KEY (id);


--
-- Name: t_sequence_counters t_sequence_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sequence_counters
    ADD CONSTRAINT t_sequence_counters_pkey PRIMARY KEY (id);


--
-- Name: t_sequence_counters t_sequence_counters_prefix_financial_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sequence_counters
    ADD CONSTRAINT t_sequence_counters_prefix_financial_year_key UNIQUE (prefix, financial_year);


--
-- Name: t_show_cause t_show_cause_notice_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key1 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key10 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key11 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key12 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key13 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key14 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key15 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key16 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key17 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key18 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key19 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key2 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key20 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key21 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key22 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key23 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key24 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key25 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key26 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key27 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key28 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key29 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key3 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key30 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key31 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key32 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key33 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key34 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key35 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key36 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key37 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key38 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key39 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key4 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key40 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key41 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key42 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key43 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key44 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key45 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key46 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key47 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key48 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key49 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key5 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key50 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key51 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key52 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key53 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key54 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key55 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key56 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key57 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key58 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key59 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key6 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key60 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key61 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key62 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key63 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key64 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key65 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key66 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key67 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key68 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key69 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key7 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key70 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key71 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key72 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key73 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key74 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key75 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key76 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key77 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key78 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key79 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key8 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key80 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key81 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key82 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key83 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key84 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key85 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key86 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key87 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key88 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key89 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key9 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_notice_no_key90; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_notice_no_key90 UNIQUE (notice_no);


--
-- Name: t_show_cause t_show_cause_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_show_cause
    ADD CONSTRAINT t_show_cause_pkey PRIMARY KEY (id);


--
-- Name: t_skill_matrix t_skill_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_skill_matrix
    ADD CONSTRAINT t_skill_matrix_pkey PRIMARY KEY (id);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key1 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key10 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key11 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key12 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key13 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key14 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key15 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key16 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key17 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key18 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key19 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key2 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key20 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key21 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key22 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key23 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key24 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key25 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key26 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key3 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key4 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key5 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key6 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key7 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key8 UNIQUE (audit_no);


--
-- Name: t_stock_audit t_stock_audit_audit_no_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_audit_no_key9 UNIQUE (audit_no);


--
-- Name: t_stock_audit_item t_stock_audit_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit_item
    ADD CONSTRAINT t_stock_audit_item_pkey PRIMARY KEY (id);


--
-- Name: t_stock_audit t_stock_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit
    ADD CONSTRAINT t_stock_audit_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_issue t_subcontract_issue_issue_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue
    ADD CONSTRAINT t_subcontract_issue_issue_no_key UNIQUE (issue_no);


--
-- Name: t_subcontract_issue_item t_subcontract_issue_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue_item
    ADD CONSTRAINT t_subcontract_issue_item_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_issue t_subcontract_issue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue
    ADD CONSTRAINT t_subcontract_issue_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_order_item t_subcontract_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order_item
    ADD CONSTRAINT t_subcontract_order_item_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_order t_subcontract_order_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order
    ADD CONSTRAINT t_subcontract_order_order_no_key UNIQUE (order_no);


--
-- Name: t_subcontract_order t_subcontract_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order
    ADD CONSTRAINT t_subcontract_order_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_receipt_item t_subcontract_receipt_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt_item
    ADD CONSTRAINT t_subcontract_receipt_item_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_receipt t_subcontract_receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt
    ADD CONSTRAINT t_subcontract_receipt_pkey PRIMARY KEY (id);


--
-- Name: t_subcontract_receipt t_subcontract_receipt_receipt_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt
    ADD CONSTRAINT t_subcontract_receipt_receipt_no_key UNIQUE (receipt_no);


--
-- Name: t_training_course t_training_course_course_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key1 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key10 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key11 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key12 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key13 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key14 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key15 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key16 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key17 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key18 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key19 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key2 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key20 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key21 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key22 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key23 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key24 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key25 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key26 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key27 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key28 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key29 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key3 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key30 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key31 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key32 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key33 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key34 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key35 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key36 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key37 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key38 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key39 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key4 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key40 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key41 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key42 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key43 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key44 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key45 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key46 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key47 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key48 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key49 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key5 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key50 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key51 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key52 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key53 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key54 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key55 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key56 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key57 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key58 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key59 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key6 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key60 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key61 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key62 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key63 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key7 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key8 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_course_code_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_course_code_key9 UNIQUE (course_code);


--
-- Name: t_training_course t_training_course_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_course
    ADD CONSTRAINT t_training_course_pkey PRIMARY KEY (id);


--
-- Name: t_training_participant t_training_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_participant
    ADD CONSTRAINT t_training_participant_pkey PRIMARY KEY (id);


--
-- Name: t_training_session t_training_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_pkey PRIMARY KEY (id);


--
-- Name: t_training_session t_training_session_session_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key1 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key10 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key11 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key12 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key13 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key14 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key15 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key16 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key17 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key18 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key19 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key2 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key20 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key21 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key22 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key23 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key24 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key25 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key26 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key27 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key28 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key29 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key3 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key30 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key31 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key32 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key33 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key34 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key35 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key36 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key37 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key38 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key39 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key4 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key40 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key41 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key42 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key43 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key44 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key45 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key46 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key47 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key48 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key49 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key5 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key50 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key51 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key52 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key53 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key54 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key55 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key56 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key57 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key58 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key59 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key6 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key60 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key61 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key62 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key63 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key7 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key8 UNIQUE (session_code);


--
-- Name: t_training_session t_training_session_session_code_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_training_session
    ADD CONSTRAINT t_training_session_session_code_key9 UNIQUE (session_code);


--
-- Name: t_vendor_rating t_vendor_rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_vendor_rating
    ADD CONSTRAINT t_vendor_rating_pkey PRIMARY KEY (id);


--
-- Name: tour_application tour_application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_application
    ADD CONSTRAINT tour_application_pkey PRIMARY KEY (tour_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: voucher_items voucher_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_pkey PRIMARY KEY (id);


--
-- Name: voucher_types voucher_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_types
    ADD CONSTRAINT voucher_types_code_key UNIQUE (code);


--
-- Name: voucher_types voucher_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_types
    ADD CONSTRAINT voucher_types_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_voucher_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_voucher_no_key UNIQUE (voucher_no);


--
-- Name: woff_application woff_application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.woff_application
    ADD CONSTRAINT woff_application_pkey PRIMARY KEY (woff_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: e_q__e_m_p__g_a_t_t__c__e_m_p_i_d__c__d_a_t_e; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX e_q__e_m_p__g_a_t_t__c__e_m_p_i_d__c__d_a_t_e ON public."EQ_EMP_GATT" USING btree ("C_EMPID", "C_DATE");


--
-- Name: e_q__e_m_p__p_a_y_s_l_i_p__c__m_o_n_t_h__c__y_e_a_r__c__e_m_p_i; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX e_q__e_m_p__p_a_y_s_l_i_p__c__m_o_n_t_h__c__y_e_a_r__c__e_m_p_i ON public."EQ_EMP_PAYSLIP" USING btree ("C_MONTH", "C_YEAR", "C_EMPID");


--
-- Name: emp_attendance_att_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emp_attendance_att_date ON public.emp_attendance USING btree (att_date);


--
-- Name: emp_attendance_empid_att_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX emp_attendance_empid_att_date ON public.emp_attendance USING btree (empid, att_date);


--
-- Name: idx_pr_amendment_req; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_amendment_req ON public.t_pr_amendment USING btree (requisition_id);


--
-- Name: idx_tax_investment_emp_yr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_investment_emp_yr ON public.t_emp_tax_investment USING btree (empid, financial_year);


--
-- Name: m_product_category_name_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX m_product_category_name_parent_id ON public.m_product_category USING btree (name, parent_id);


--
-- Name: salary_register_empid_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX salary_register_empid_year_month ON public.salary_register USING btree (empid, year, month);


--
-- Name: t_sequence_counters_prefix_financial_year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX t_sequence_counters_prefix_financial_year ON public.t_sequence_counters USING btree (prefix, financial_year);


--
-- Name: Users Users_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_empid_fkey" FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE;


--
-- Name: budgets budgets_financial_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_financial_year_id_fkey FOREIGN KEY (financial_year_id) REFERENCES public.financial_years(id) ON UPDATE CASCADE;


--
-- Name: chart_of_accounts chart_of_accounts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: emp_attendance emp_attendance_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emp_attendance
    ADD CONSTRAINT emp_attendance_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_application leave_application_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_application
    ADD CONSTRAINT leave_application_empid_fkey FOREIGN KEY (empid) REFERENCES public.leave_master(empid) ON UPDATE CASCADE;


--
-- Name: leave_details leave_details_lno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_details
    ADD CONSTRAINT leave_details_lno_fkey FOREIGN KEY (lno) REFERENCES public.leave_application(lno) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_master leave_master_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_master
    ADD CONSTRAINT leave_master_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_emp_experience m_emp_experience_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_experience
    ADD CONSTRAINT m_emp_experience_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: m_emp_family m_emp_family_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_family
    ADD CONSTRAINT m_emp_family_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: m_emp_off_det m_emp_off_det_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_off_det
    ADD CONSTRAINT m_emp_off_det_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_emp_qualification m_emp_qualification_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_qualification
    ADD CONSTRAINT m_emp_qualification_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: m_emp_salary m_emp_salary_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_emp_salary
    ADD CONSTRAINT m_emp_salary_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: m_grn_item m_grn_item_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn_item
    ADD CONSTRAINT m_grn_item_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.m_grn(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_grn m_grn_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_grn
    ADD CONSTRAINT m_grn_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.m_purchase_order(id) ON UPDATE CASCADE;


--
-- Name: m_item_master m_item_master_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.m_item_group(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_item_master m_item_master_subgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_subgroup_id_fkey FOREIGN KEY (subgroup_id) REFERENCES public.m_item_subgroup(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_item_master m_item_master_subtype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_subtype_id_fkey FOREIGN KEY (subtype_id) REFERENCES public.m_item_subtype(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_item_master m_item_master_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.m_item_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_item_master m_item_master_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_master
    ADD CONSTRAINT m_item_master_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.m_unit(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_item_subgroup m_item_subgroup_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subgroup
    ADD CONSTRAINT m_item_subgroup_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.m_item_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_item_subtype m_item_subtype_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_subtype
    ADD CONSTRAINT m_item_subtype_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.m_item_type(id) ON UPDATE CASCADE;


--
-- Name: m_item_type m_item_type_subgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_item_type
    ADD CONSTRAINT m_item_type_subgroup_id_fkey FOREIGN KEY (subgroup_id) REFERENCES public.m_item_subgroup(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_product_category m_product_category_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_category
    ADD CONSTRAINT m_product_category_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.m_product_category(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: m_product_item_master m_product_item_master_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_product_item_master
    ADD CONSTRAINT m_product_item_master_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.m_product_master(id) ON UPDATE CASCADE;


--
-- Name: m_purchase_order_item m_purchase_order_item_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_order_item
    ADD CONSTRAINT m_purchase_order_item_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.m_purchase_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_purchase_requisition_item m_purchase_requisition_item_requisition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_purchase_requisition_item
    ADD CONSTRAINT m_purchase_requisition_item_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES public.m_purchase_requisition(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_rfq_item m_rfq_item_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_item
    ADD CONSTRAINT m_rfq_item_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.m_rfq(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_rfq_vendor m_rfq_vendor_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_rfq_vendor
    ADD CONSTRAINT m_rfq_vendor_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.m_rfq(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: m_vendor_price_list m_vendor_price_list_supplier_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_vendor_price_list
    ADD CONSTRAINT m_vendor_price_list_supplier_id_fkey1 FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: profile_update_requests profile_update_requests_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_update_requests
    ADD CONSTRAINT profile_update_requests_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: shift_schedule shift_schedule_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_schedule
    ADD CONSTRAINT shift_schedule_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid) ON UPDATE CASCADE;


--
-- Name: t_bom_item t_bom_item_bom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom_item
    ADD CONSTRAINT t_bom_item_bom_id_fkey FOREIGN KEY (bom_id) REFERENCES public.t_bom(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_bom_item t_bom_item_parent_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom_item
    ADD CONSTRAINT t_bom_item_parent_item_id_fkey FOREIGN KEY (parent_item_id) REFERENCES public.t_bom_item(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: t_bom_item t_bom_item_sub_bom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_bom_item
    ADD CONSTRAINT t_bom_item_sub_bom_id_fkey FOREIGN KEY (sub_bom_id) REFERENCES public.t_bom(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: t_delivery_challan_item t_delivery_challan_item_dc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_delivery_challan_item
    ADD CONSTRAINT t_delivery_challan_item_dc_id_fkey FOREIGN KEY (dc_id) REFERENCES public.t_delivery_challan(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_emp_tax_computation t_emp_tax_computation_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_computation
    ADD CONSTRAINT t_emp_tax_computation_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid);


--
-- Name: t_emp_tax_investment t_emp_tax_investment_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_investment
    ADD CONSTRAINT t_emp_tax_investment_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid);


--
-- Name: t_emp_tax_regime t_emp_tax_regime_empid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_emp_tax_regime
    ADD CONSTRAINT t_emp_tax_regime_empid_fkey FOREIGN KEY (empid) REFERENCES public.employee_master(empid);


--
-- Name: t_gate_entry_item t_gate_entry_item_gate_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_gate_entry_item
    ADD CONSTRAINT t_gate_entry_item_gate_entry_id_fkey FOREIGN KEY (gate_entry_id) REFERENCES public.t_gate_entry(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_ir_item t_grn_item_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir_item
    ADD CONSTRAINT t_grn_item_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.t_ir(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_ir t_grn_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.t_purchase_order(id) ON UPDATE CASCADE;


--
-- Name: t_ir t_grn_supplier_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_ir
    ADD CONSTRAINT t_grn_supplier_id_fkey1 FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: t_invoice_item t_invoice_item_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_invoice_item
    ADD CONSTRAINT t_invoice_item_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.t_invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_leads t_leads_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_leads
    ADD CONSTRAINT t_leads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.m_customer_master(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_material_issue_item t_material_issue_item_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue_item
    ADD CONSTRAINT t_material_issue_item_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.t_material_issue(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_material_issue t_material_issue_req_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_issue
    ADD CONSTRAINT t_material_issue_req_id_fkey FOREIGN KEY (req_id) REFERENCES public.t_material_requisition(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: t_material_requisition_item t_material_requisition_item_req_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_requisition_item
    ADD CONSTRAINT t_material_requisition_item_req_id_fkey FOREIGN KEY (req_id) REFERENCES public.t_material_requisition(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_material_return_item t_material_return_item_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_material_return_item
    ADD CONSTRAINT t_material_return_item_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.t_material_return(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_non_conformance t_non_conformance_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_non_conformance
    ADD CONSTRAINT t_non_conformance_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.t_quality_inspection(id) ON UPDATE CASCADE;


--
-- Name: t_pr_amendment t_pr_amendment_requisition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_amendment
    ADD CONSTRAINT t_pr_amendment_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES public.t_purchase_requisition(id) ON UPDATE CASCADE;


--
-- Name: t_pr_sanction t_pr_sanction_pr_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_sanction
    ADD CONSTRAINT t_pr_sanction_pr_item_id_fkey FOREIGN KEY (pr_item_id) REFERENCES public.t_purchase_requisition_item(id) ON UPDATE CASCADE;


--
-- Name: t_pr_sanction t_pr_sanction_requisition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_sanction
    ADD CONSTRAINT t_pr_sanction_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES public.t_purchase_requisition(id) ON UPDATE CASCADE;


--
-- Name: t_pr_sanction t_pr_sanction_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_pr_sanction
    ADD CONSTRAINT t_pr_sanction_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: t_production_order_item t_production_order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_production_order_item
    ADD CONSTRAINT t_production_order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.t_production_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_purchase_order_item t_purchase_order_item_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order_item
    ADD CONSTRAINT t_purchase_order_item_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.t_purchase_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_purchase_order t_purchase_order_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_order
    ADD CONSTRAINT t_purchase_order_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: t_purchase_requisition_item t_purchase_requisition_item_requisition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_purchase_requisition_item
    ADD CONSTRAINT t_purchase_requisition_item_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES public.t_purchase_requisition(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_quality_inspection_items t_quality_inspection_items_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quality_inspection_items
    ADD CONSTRAINT t_quality_inspection_items_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.t_quality_inspection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_quotation_items t_quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotation_items
    ADD CONSTRAINT t_quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.t_quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_quotations t_quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotations
    ADD CONSTRAINT t_quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.m_customer_master(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_quotations t_quotations_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_quotations
    ADD CONSTRAINT t_quotations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.t_leads(id) ON UPDATE CASCADE;


--
-- Name: t_rfq_item t_rfq_item_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_item
    ADD CONSTRAINT t_rfq_item_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.t_rfq(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_rfq_vendor t_rfq_vendor_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_vendor
    ADD CONSTRAINT t_rfq_vendor_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.t_rfq(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_rfq_vendor t_rfq_vendor_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_rfq_vendor
    ADD CONSTRAINT t_rfq_vendor_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: t_sales_order_items t_sales_order_items_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_order_items
    ADD CONSTRAINT t_sales_order_items_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.t_sales_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_sales_orders t_sales_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_orders
    ADD CONSTRAINT t_sales_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.m_customer_master(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_sales_orders t_sales_orders_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_sales_orders
    ADD CONSTRAINT t_sales_orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.t_quotations(id) ON UPDATE CASCADE;


--
-- Name: t_stock_audit_item t_stock_audit_item_audit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_stock_audit_item
    ADD CONSTRAINT t_stock_audit_item_audit_id_fkey FOREIGN KEY (audit_id) REFERENCES public.t_stock_audit(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_subcontract_issue_item t_subcontract_issue_item_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue_item
    ADD CONSTRAINT t_subcontract_issue_item_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.t_subcontract_issue(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_subcontract_issue t_subcontract_issue_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_issue
    ADD CONSTRAINT t_subcontract_issue_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.t_subcontract_order(id) ON UPDATE CASCADE;


--
-- Name: t_subcontract_order_item t_subcontract_order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_order_item
    ADD CONSTRAINT t_subcontract_order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.t_subcontract_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_subcontract_receipt_item t_subcontract_receipt_item_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt_item
    ADD CONSTRAINT t_subcontract_receipt_item_receipt_id_fkey FOREIGN KEY (receipt_id) REFERENCES public.t_subcontract_receipt(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: t_subcontract_receipt t_subcontract_receipt_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_subcontract_receipt
    ADD CONSTRAINT t_subcontract_receipt_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.t_subcontract_order(id) ON UPDATE CASCADE;


--
-- Name: t_vendor_rating t_vendor_rating_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_vendor_rating
    ADD CONSTRAINT t_vendor_rating_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.m_party_master(id) ON UPDATE CASCADE;


--
-- Name: voucher_items voucher_items_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voucher_items voucher_items_against_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_against_account_id_fkey FOREIGN KEY (against_account_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: voucher_items voucher_items_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vouchers vouchers_financial_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_financial_year_id_fkey FOREIGN KEY (financial_year_id) REFERENCES public.financial_years(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vouchers vouchers_voucher_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_voucher_type_id_fkey FOREIGN KEY (voucher_type_id) REFERENCES public.voucher_types(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

