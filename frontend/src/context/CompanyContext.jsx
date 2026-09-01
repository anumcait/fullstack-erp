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
        favicon_url: '',
        pf_number: '',
        esi_number: ''
    });
    const [companyConfigured, setCompanyConfigured] = useState(false);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState(false);

    const fetchSettings = async () => {
        setCompanyLoading(true);
        setCompanyError(false);
        let data = null;
        let lastErr = null;
        // Retry transient failures — a single failed GET must not send an
        // already-configured instance to the "Create Company" setup screen.
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const res = await axios.get(`/api/settings/company`);
                data = res.data;
                break;
            } catch (err) {
                lastErr = err;
                console.error(`Error loading company settings (attempt ${attempt}):`, err);
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 400 * attempt));
                }
            }
        }
        if (data && data.company_name) {
            setCompanySettings(data);
            setCompanyConfigured(true);
            setCompanyError(false);
        } else if (lastErr) {
            // The request failed (DB error / backend down / network) — this is NOT
            // a fresh install. Do not redirect to the Create-Company setup screen;
            // surface an error state so the user can retry.
            setCompanyError(true);
            setCompanyConfigured(false);
        } else {
            // 200 response with no company_name => genuinely not configured yet.
            setCompanyConfigured(false);
            setCompanyError(false);
        }
        setCompanyLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const companyShortName = companyConfigured
        ? (companySettings.short_name || (companySettings.company_name ? companySettings.company_name.split(/\s+/)[0] : ''))
        : '';

    useEffect(() => {
        const url = companySettings?.favicon_url || companySettings?.logo_url;
        if (url) {
            const link = document.getElementById('favicon');
            if (link) link.href = url;
        }
    }, [companySettings?.favicon_url, companySettings?.logo_url]);

    return (
        <CompanyContext.Provider value={{
            companyName: companyConfigured ? (companySettings.company_name || '') : '',
            companyShortName,
            companySettings,
            companyConfigured,
            companyLoading,
            companyError,
            refreshCompanySettings: fetchSettings
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
