
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { queryClient } from './queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <LanguageProvider>
                    <BrowserRouter>
                        {children}
                    </BrowserRouter>
                </LanguageProvider>
            </HelmetProvider>
        </QueryClientProvider>
    );
}
