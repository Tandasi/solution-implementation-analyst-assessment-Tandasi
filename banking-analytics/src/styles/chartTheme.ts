/**
 * Professional Chart Theme and Styling Configuration
 * Provides consistent, enterprise-grade visual styling for all charts
 */

export const PROFESSIONAL_THEME = {
  colors: {
    primary: '#2563eb',      // Professional blue
    secondary: '#64748b',    // Neutral gray
    success: '#059669',      // Professional green
    warning: '#d97706',      // Professional orange
    danger: '#dc2626',       // Professional red
    info: '#0891b2',         // Professional cyan
    purple: '#7c3aed',       // Professional purple
    pink: '#db2777',         // Professional pink
    gradient: {
      primary: ['#2563eb', '#1d4ed8'],
      success: ['#059669', '#047857'],
      warning: ['#d97706', '#b45309'],
      danger: ['#dc2626', '#b91c1c'],
    }
  },
  fonts: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      title: '16px',
      label: '12px',
      tick: '11px',
      legend: '13px'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    margin: { top: 20, right: 30, bottom: 20, left: 30 },
    padding: 16,
    borderRadius: 8
  },
  grid: {
    stroke: '#e2e8f0',
    strokeWidth: 1,
    strokeDasharray: '3 3'
  },
  shadows: {
    light: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    heavy: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
};

export const CHART_COLORS = [
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', 
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#be185d',
  '#4338ca', '#0d9488', '#ca8a04', '#be123c', '#9333ea'
];

export const PROFESSIONAL_CHART_STYLES = {
  // Bar Chart Styles
  barChart: {
    barRadius: 4,
    barOpacity: 0.8,
    hoverOpacity: 0.9,
    animationDuration: 800,
    animationEasing: 'ease-out'
  },
  
  // Line Chart Styles
  lineChart: {
    strokeWidth: 3,
    strokeOpacity: 0.9,
    dotRadius: 4,
    dotStrokeWidth: 2,
    animationDuration: 1000,
    animationEasing: 'ease-in-out'
  },
  
  // Pie Chart Styles
  pieChart: {
    innerRadius: 0,
    outerRadius: 120,
    labelRadius: 140,
    animationDuration: 600,
    animationEasing: 'ease-out'
  },
  
  // Area Chart Styles
  areaChart: {
    strokeWidth: 2,
    fillOpacity: 0.3,
    animationDuration: 800,
    animationEasing: 'ease-out'
  }
};

export const PROFESSIONAL_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: PROFESSIONAL_THEME.shadows.medium,
  padding: '12px',
  fontSize: '13px',
  fontFamily: PROFESSIONAL_THEME.fonts.family,
  color: '#374151'
};

export const PROFESSIONAL_LEGEND_STYLE = {
  fontSize: '13px',
  fontFamily: PROFESSIONAL_THEME.fonts.family,
  fontWeight: PROFESSIONAL_THEME.fonts.weights.medium,
  color: '#374151',
  itemSpacing: 20,
  iconType: 'circle' as const,
  iconSize: 8
};

export const PROFESSIONAL_AXIS_STYLE = {
  fontSize: '11px',
  fontFamily: PROFESSIONAL_THEME.fonts.family,
  fontWeight: PROFESSIONAL_THEME.fonts.weights.normal,
  color: '#64748b',
  tickLine: false,
  axisLine: true,
  axisLineColor: '#e2e8f0',
  axisLineWidth: 1
};

export const PROFESSIONAL_LABEL_STYLE = {
  fontSize: '12px',
  fontFamily: PROFESSIONAL_THEME.fonts.family,
  fontWeight: PROFESSIONAL_THEME.fonts.weights.medium,
  color: '#374151',
  textAnchor: 'middle'
};

// Professional gradient definitions for advanced charts
export const PROFESSIONAL_GRADIENTS = {
  primary: {
    id: 'primaryGradient',
    stops: [
      { offset: '0%', stopColor: '#2563eb', stopOpacity: 0.8 },
      { offset: '100%', stopColor: '#1d4ed8', stopOpacity: 0.4 }
    ]
  },
  success: {
    id: 'successGradient',
    stops: [
      { offset: '0%', stopColor: '#059669', stopOpacity: 0.8 },
      { offset: '100%', stopColor: '#047857', stopOpacity: 0.4 }
    ]
  },
  warning: {
    id: 'warningGradient',
    stops: [
      { offset: '0%', stopColor: '#d97706', stopOpacity: 0.8 },
      { offset: '100%', stopColor: '#b45309', stopOpacity: 0.4 }
    ]
  },
  danger: {
    id: 'dangerGradient',
    stops: [
      { offset: '0%', stopColor: '#dc2626', stopOpacity: 0.8 },
      { offset: '100%', stopColor: '#b91c1c', stopOpacity: 0.4 }
    ]
  }
};

// Professional animation configurations
export const PROFESSIONAL_ANIMATIONS = {
  fadeIn: {
    duration: 600,
    easing: 'ease-out'
  },
  slideUp: {
    duration: 800,
    easing: 'ease-out'
  },
  scaleIn: {
    duration: 500,
    easing: 'ease-out'
  },
  stagger: {
    delay: 100,
    duration: 600,
    easing: 'ease-out'
  }
};

// Professional responsive breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

// Professional chart dimensions
export const CHART_DIMENSIONS = {
  small: { width: '100%', height: 250 },
  medium: { width: '100%', height: 350 },
  large: { width: '100%', height: 450 },
  xlarge: { width: '100%', height: 550 }
};

// Default export for theme
const chartTheme = {
  theme: PROFESSIONAL_THEME,
  colors: CHART_COLORS,
  styles: PROFESSIONAL_CHART_STYLES,
  tooltip: PROFESSIONAL_TOOLTIP_STYLE,
  legend: PROFESSIONAL_LEGEND_STYLE,
  axis: PROFESSIONAL_AXIS_STYLE,
  label: PROFESSIONAL_LABEL_STYLE,
  gradients: PROFESSIONAL_GRADIENTS,
  animations: PROFESSIONAL_ANIMATIONS,
  breakpoints: RESPONSIVE_BREAKPOINTS,
  dimensions: CHART_DIMENSIONS
};

export default chartTheme;
