const { CompanySettings } = require('../../models');

exports.getCompanySettings = async (req, res) => {
    try {
        const settings = await CompanySettings.findOne();
        // Return null when not configured so the frontend can show the
        // first-run "Create Company" setup (Tally-style) instead of a dummy name.
        res.json(settings || null);
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateCompanySettings = async (req, res) => {
    try {
        const {
            company_name, short_name, address, phone, email, website,
            gstin, cin, pan, show_format_no, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier
        } = req.body;

        let settings = await CompanySettings.findOne();

        if (settings) {
            // Existing company: only an authenticated user may modify it.
            if (!req.session || !req.session.user) {
                return res.status(403).json({ error: 'Login required to update company settings.' });
            }
            await settings.update({
                company_name, short_name, address, phone, email, website,
                gstin, cin, pan, show_format_no, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier,
                c_last_update: new Date()
            });
        } else {
            // First-run creation is allowed without login (initial setup only).
            settings = await CompanySettings.create({
                company_name, short_name, address, phone, email, website,
                gstin, cin, pan, show_format_no, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier,
                c_last_update: new Date()
            });
        }
        res.json({ message: settings ? 'Company created successfully' : 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
