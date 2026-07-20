const { CompanySettings } = require('../../models');

exports.getCompanySettings = async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = await CompanySettings.create({
                company_name: 'AUCTOR HOME APPLIANCES LLP'
            });
        } else if (!settings.company_name) {
            // Update if exists but empty
            await settings.update({
                company_name: 'AUCTOR HOME APPLIANCES LLP'
            });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateCompanySettings = async (req, res) => {
    try {
        const {
            company_name, address, phone, email, website,
            gstin, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier
        } = req.body;

        let settings = await CompanySettings.findOne();
        if (settings) {
            await settings.update({
                company_name, address, phone, email, website,
                gstin, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier,
                c_last_update: new Date()
            });
        } else {
            settings = await CompanySettings.create({
                company_name, address, phone, email, website,
                gstin, pf_number, esi_number, logo_url, payroll_pt_rate, payroll_ot_multiplier,
                c_last_update: new Date()
            });
        }
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
