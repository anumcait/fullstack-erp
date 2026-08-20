import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CompanyContext = createContext({
    companyName: '',
    companySettings: {}
});

export const CompanyProvider = ({ children }) => {
    const [companySettings, setCompanySettings] = useState({
        company_name: '',
        short_name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        gstin: '',
        cin: '',
        pan: '',
        logo_url: '',
        show_format_no: true,
        pf_number: '',
        esi_number: ''
    });
    const [companyConfigured, setCompanyConfigured] = useState(false);
    const [companyLoading, setCompanyLoading] = useState(true);

    const fetchSettings = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/settings/company`)
            .then(res => {
                if (res.data && res.data.company_name) {
                    setCompanySettings(res.data);
                    setCompanyConfigured(true);
                } else {
                    setCompanyConfigured(false);
                }
            })
            .catch(err => console.error('Error loading company settings:', err))
            .finally(() => setCompanyLoading(false));
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const companyShortName = companyConfigured
        ? (companySettings.short_name || (companySettings.company_name ? companySettings.company_name.split(/\s+/)[0] : ''))
        : '';

    return (
        <CompanyContext.Provider value={{
            companyName: companyConfigured ? (companySettings.company_name || '') : '',
            companyShortName,
            companySettings,
            companyConfigured,
            companyLoading,
            refreshCompanySettings: fetchSettings
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
