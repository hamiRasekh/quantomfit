/**
 * Persian Dashboard Wrapper
 * Wraps dashboard content and converts all numbers to Persian
 */

'use client';

import { useEffect } from 'react';
import { toPersianNumber } from '@/lib/utils/persian-utils';

interface PersianDashboardWrapperProps {
    children: React.ReactNode;
}

export function PersianDashboardWrapper({ children }: PersianDashboardWrapperProps) {
    useEffect(() => {
        // Function to convert all text nodes containing numbers to Persian
        const convertNumbersToPersian = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                // Check if text contains English numbers
                if (/\d/.test(text)) {
                    node.textContent = toPersianNumber(text);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip script and style tags
                const element = node as HTMLElement;
                if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
                    Array.from(node.childNodes).forEach(convertNumbersToPersian);
                }
            }
        };

        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    convertNumbersToPersian(node);
                });
            });
        });

        // Start observing
        const container = document.getElementById('persian-dashboard-container');
        if (container) {
            // Convert existing numbers
            convertNumbersToPersian(container);

            // Observe future changes
            observer.observe(container, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, []);

    return <div id="persian-dashboard-container">{children}</div>;
}

