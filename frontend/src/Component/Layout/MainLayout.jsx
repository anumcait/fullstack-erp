// components/layout/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation, useOutlet } from 'react-router-dom';
import Header from "../Partials/Header";
import Footer from "../Partials/Footer";
import Sidebar from './Sidebar';
import DocumentTitle from './DocumentTitle';
import ChatBotIcon from '../ChatBot/ChatBotIcon';
import IdleTimeout from './IdleTimeout';
import './Layout.css';

const MainLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <div className="main-layout">
      <Header />
      <DocumentTitle />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">
          <React.Fragment key={location.key}>{outlet}</React.Fragment>
        </main>
      </div>
      <ChatBotIcon />
      <Footer />
      <IdleTimeout />
    </div>
  );
};

export default MainLayout;
