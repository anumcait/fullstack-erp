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
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const res = await axios.get(`/api/company-settings`).catch(async (e) => {
                    if (e?.response?.status === 404) throw e;
                    return await axios.get(`/api/settings/company`);
                });
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
        const link = document.getElementById('favicon');
        if (link) {
            if (url && url !== '/logo.png') {
                link.href = url;
            } else {
                link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%231976d2'/%3E%3Ctext x='50%25' y='68%25' font-size='55' font-weight='bold' font-family='sans-serif' fill='white' text-anchor='middle'%3EE%3C/text%3E%3C/svg%3E";
            }
        }
        if (companySettings?.logo_url && companySettings.logo_url !== '/logo.png') {
            localStorage.setItem('cached_logo_url', companySettings.logo_url);
        } else {
            localStorage.removeItem('cached_logo_url');
        }
        if (companySettings?.favicon_url && companySettings.favicon_url !== '/logo.png') {
            localStorage.setItem('cached_favicon_url', companySettings.favicon_url);
        } else {
            localStorage.removeItem('cached_favicon_url');
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
