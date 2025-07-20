import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enhanced Web Vitals tracking with detailed reporting
const sendToAnalytics = (metric: any) => {
  // In production, send to your analytics service
  console.log('Web Vital:', metric);
  
  // Example: Send to Google Analytics 4
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      custom_parameter_1: metric.navigationType,
    });
  }
  
  // You can also send to other analytics services here
  // Example: Sentry, LogRocket, DataDog, etc.
};

// Track all Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Performance budget monitoring
const performanceBudgets = {
  LCP: 2500, // Large Contentful Paint should be under 2.5s
  FID: 100,  // First Input Delay should be under 100ms
  CLS: 0.1,  // Cumulative Layout Shift should be under 0.1
};

const checkPerformanceBudget = (metric: any) => {
  const budget = performanceBudgets[metric.name as keyof typeof performanceBudgets];
  if (budget && metric.value > budget) {
    console.warn(`⚠️ Performance Budget Exceeded: ${metric.name} = ${metric.value}ms (budget: ${budget}ms)`);
    
    // In production, you might want to send alerts
    if (process.env.NODE_ENV === 'production') {
      // Send alert to monitoring service
    }
  } else if (budget) {
    console.log(`✅ Performance Budget OK: ${metric.name} = ${metric.value}ms (budget: ${budget}ms)`);
  }
};

// Monitor performance budgets
getCLS((metric) => { sendToAnalytics(metric); checkPerformanceBudget(metric); });
getFID((metric) => { sendToAnalytics(metric); checkPerformanceBudget(metric); });
getLCP((metric) => { sendToAnalytics(metric); checkPerformanceBudget(metric); });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendToAnalytics);
