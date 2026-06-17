import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CompanyContext = createContext({
    companyName: '',
    companySettings: {}
});

export const CompanyProvider = ({ children }) => {
    const [companySettings, setCompanySettings] = useState({
        company_name: '',
        address: '',
        phone: '',
        email: '',
        gstin: '',
        pf_number: '',
        esi_number: ''
    });

    const fetchSettings = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/settings/company`)
            .then(res => {
                if (res.data) setCompanySettings(res.data);
            })
            .catch(err => console.error('Error loading company settings:', err));
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <CompanyContext.Provider value={{
            companyName: companySettings.company_name || 'AUCTOR HOME APPLIANCES LLP',
            companySettings,
            refreshCompanySettings: fetchSettings
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
