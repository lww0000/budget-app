import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Savings from './components/Savings';
import Upgrade from './components/Upgrade';
import Profile from './components/Profile';
import TransactionsPage from './components/TransactionsPage';

export default function App() {
  return (
    <FinanceProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route 
               path="tracking" 
               element={<TransactionsPage title="All Transactions" description="A complete history of your financial activity." />} 
            />
            <Route 
               path="income" 
               element={<TransactionsPage title="Income Stream" type="income" description="Track your earnings and revenue sources." />} 
            />
            <Route 
               path="expenses" 
               element={<TransactionsPage title="Expense Tracker" type="expense" description="Monitor where your money is going." />} 
            />
            <Route 
               path="bills" 
               element={<TransactionsPage title="Recurring Bills" type="bill" description="Manage your monthly commitments." />} 
            />
            <Route path="savings" element={<Savings />} />
            <Route path="analysis" element={<Savings />} />
            <Route path="upgrade" element={<Upgrade />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </FinanceProvider>
  );
}