import React from 'react';

// A lightweight, highly realistic SVG-based mockup component for resume templates.
export default function TemplateMockup({ templateId, isSelected }) {
  // Determine layout and color characteristics based on the template ID
  const id = templateId || '';
  
  let primaryColor = '#3b82f6'; // default blue
  let secondaryColor = '#94a3b8'; // default gray
  let bgColor = '#ffffff';
  let layout = 'classic'; // classic, two-column-left, two-column-right, minimal, header-accent
  let headerAlign = 'center'; // left, center
  let fontStyle = 'sans'; // sans, serif, mono

  if (id.includes('modern_blue')) {
    primaryColor = '#2563eb'; layout = 'header-accent'; headerAlign = 'left';
  } else if (id.includes('teal_clean')) {
    primaryColor = '#0d9488'; layout = 'classic'; headerAlign = 'left';
  } else if (id.includes('classic_black') || id.includes('classic_jake')) {
    primaryColor = '#171717'; layout = 'classic'; headerAlign = 'center'; fontStyle = 'serif';
  } else if (id.includes('executive')) {
    primaryColor = '#b45309'; bgColor = '#fafaf9'; layout = 'classic'; headerAlign = 'center'; fontStyle = 'serif';
  } else if (id.includes('two_column')) {
    primaryColor = '#4f46e5'; layout = 'two-column-left'; headerAlign = 'left';
  } else if (id.includes('minimal_mono')) {
    primaryColor = '#3f3f46'; layout = 'minimal'; headerAlign = 'left'; fontStyle = 'mono';
  } else if (id.includes('blue_accent')) {
    primaryColor = '#0284c7'; layout = 'two-column-right'; headerAlign = 'left';
  } else if (id.includes('teal_garamond')) {
    primaryColor = '#0f766e'; layout = 'classic'; headerAlign = 'center'; fontStyle = 'serif';
  } else if (id.includes('charter_clean')) {
    primaryColor = '#059669'; layout = 'classic'; headerAlign = 'left'; fontStyle = 'serif';
  } else if (id.includes('navy_uppercase')) {
    primaryColor = '#1e3a8a'; layout = 'classic'; headerAlign = 'center';
  } else if (id.includes('crimson_double')) {
    primaryColor = '#e11d48'; layout = 'classic'; headerAlign = 'center'; fontStyle = 'serif';
  } else if (id.includes('purple_tri')) {
    primaryColor = '#7e22ce'; layout = 'header-accent'; headerAlign = 'center';
  } else if (id.includes('slate_ruled')) {
    primaryColor = '#475569'; layout = 'classic'; headerAlign = 'left'; bgColor = '#f8fafc';
  } else if (id.includes('sidebar')) {
    primaryColor = '#334155'; layout = 'two-column-left';
  }

  // Common SVG dimensions
  const w = 210;
  const h = 297; // A4 ratio
  
  // Render different layouts
  const renderLayout = () => {
    switch (layout) {
      case 'header-accent':
        return (
          <>
            <rect x="0" y="0" width={w} height="45" fill={primaryColor} opacity="0.1" />
            <rect x="0" y="0" width={w} height="4" fill={primaryColor} />
            
            {/* Header Content */}
            <rect x="20" y="15" width="80" height="6" fill={primaryColor} rx="1" />
            <rect x="20" y="26" width="120" height="3" fill={secondaryColor} rx="0.5" opacity="0.8" />
            
            {/* Sections */}
            <rect x="20" y="55" width="40" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="65" width={w - 40} height="2" fill={secondaryColor} opacity="0.3" rx="0.5" />
            <rect x="20" y="72" width={w - 40} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="20" y="78" width={w - 60} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="20" y="84" width={w - 50} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            
            <rect x="20" y="100" width="40" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="110" width={w - 40} height="2" fill={secondaryColor} opacity="0.3" rx="0.5" />
            <circle cx="23" cy="120" r="1.5" fill={secondaryColor} />
            <rect x="28" y="119" width={w - 60} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="128" r="1.5" fill={secondaryColor} />
            <rect x="28" y="127" width={w - 70} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="136" r="1.5" fill={secondaryColor} />
            <rect x="28" y="135" width={w - 55} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            
            <rect x="20" y="155" width="40" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="165" width={w - 40} height="2" fill={secondaryColor} opacity="0.3" rx="0.5" />
            <rect x="20" y="172" width="60" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <rect x="20" y="178" width="50" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
          </>
        );
        
      case 'two-column-left':
        return (
          <>
            {/* Sidebar */}
            <rect x="0" y="0" width="65" height={h} fill={primaryColor} opacity="0.08" />
            
            {/* Sidebar Content */}
            <rect x="10" y="20" width="45" height="5" fill={primaryColor} rx="1" />
            <rect x="10" y="30" width="35" height="2" fill={primaryColor} opacity="0.6" rx="0.5" />
            
            <rect x="10" y="50" width="25" height="3" fill={primaryColor} rx="0.5" />
            <rect x="10" y="60" width="45" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            <rect x="10" y="65" width="40" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            <rect x="10" y="70" width="42" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            
            <rect x="10" y="90" width="25" height="3" fill={primaryColor} rx="0.5" />
            <rect x="10" y="100" width="40" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            <rect x="10" y="105" width="35" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            <rect x="10" y="110" width="45" height="1.5" fill={primaryColor} opacity="0.5" rx="0.5" />
            
            {/* Main Content */}
            <rect x="75" y="20" width="40" height="4" fill={primaryColor} opacity="0.8" rx="0.5" />
            <rect x="75" y="30" width={w - 95} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="75" y="36" width={w - 110} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            
            <rect x="75" y="55" width="40" height="4" fill={primaryColor} opacity="0.8" rx="0.5" />
            <rect x="75" y="65" width="60" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <circle cx="78" cy="75" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="83" y="74" width={w - 105} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="78" cy="83" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="83" y="82" width={w - 120} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="78" cy="91" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="83" y="90" width={w - 110} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            
            <rect x="75" y="115" width="60" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <circle cx="78" cy="125" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="83" y="124" width={w - 105} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="78" cy="133" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="83" y="132" width={w - 115} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
          </>
        );

      case 'two-column-right':
        return (
          <>
            {/* Sidebar */}
            <rect x={w - 65} y="0" width="65" height={h} fill={primaryColor} opacity="0.08" />
            
            {/* Main Content */}
            <rect x="20" y="20" width="60" height="6" fill={primaryColor} rx="1" />
            <rect x="20" y="32" width="80" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            
            <rect x="20" y="50" width="30" height="4" fill={primaryColor} opacity="0.8" rx="0.5" />
            <rect x="20" y="60" width={w - 105} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="20" y="66" width={w - 120} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            
            <rect x="20" y="85" width="30" height="4" fill={primaryColor} opacity="0.8" rx="0.5" />
            <rect x="20" y="95" width="50" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <circle cx="23" cy="105" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="104" width={w - 115} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="113" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="112" width={w - 130} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="121" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="120" width={w - 110} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            
            {/* Sidebar Content */}
            <rect x={w - 55} y="50" width="25" height="3" fill={primaryColor} rx="0.5" />
            <rect x={w - 55} y="60" width="45" height="1.5" fill={primaryColor} opacity="0.6" rx="0.5" />
            <rect x={w - 55} y="65" width="40" height="1.5" fill={primaryColor} opacity="0.6" rx="0.5" />
            <rect x={w - 55} y="70" width="42" height="1.5" fill={primaryColor} opacity="0.6" rx="0.5" />
            
            <rect x={w - 55} y="90" width="25" height="3" fill={primaryColor} rx="0.5" />
            <rect x={w - 55} y="100" width="40" height="1.5" fill={primaryColor} opacity="0.6" rx="0.5" />
            <rect x={w - 55} y="105" width="35" height="1.5" fill={primaryColor} opacity="0.6" rx="0.5" />
          </>
        );

      case 'minimal':
        return (
          <>
            {/* Header Content */}
            <rect x="20" y="20" width="80" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="28" width="100" height="1.5" fill={secondaryColor} rx="0.5" opacity="0.6" />
            
            {/* Sections */}
            <rect x="20" y="50" width="30" height="3" fill={primaryColor} rx="0.5" opacity="0.9" />
            <rect x="20" y="60" width={w - 40} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            <rect x="20" y="66" width={w - 60} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            <rect x="20" y="72" width={w - 50} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            
            <rect x="20" y="90" width="30" height="3" fill={primaryColor} rx="0.5" opacity="0.9" />
            <rect x="20" y="100" width="60" height="1.5" fill={primaryColor} opacity="0.7" rx="0.5" />
            <rect x="20" y="108" width={w - 40} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            <rect x="20" y="114" width={w - 50} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            <rect x="20" y="120" width={w - 70} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            
            <rect x="20" y="135" width="60" height="1.5" fill={primaryColor} opacity="0.7" rx="0.5" />
            <rect x="20" y="143" width={w - 40} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
            <rect x="20" y="149" width={w - 60} height="1.5" fill={secondaryColor} opacity="0.4" rx="0.5" />
          </>
        );
        
      case 'classic':
      default:
        const xOffset = headerAlign === 'center' ? (w / 2) : 20;
        const alignAdjust = headerAlign === 'center' ? 'middle' : 'start';
        return (
          <>
            {/* Header Content */}
            {headerAlign === 'center' ? (
              <>
                <rect x={(w - 80) / 2} y="15" width="80" height="6" fill={primaryColor} rx="1" />
                <rect x={(w - 120) / 2} y="26" width="120" height="2" fill={secondaryColor} rx="0.5" opacity="0.8" />
              </>
            ) : (
              <>
                <rect x="20" y="15" width="80" height="6" fill={primaryColor} rx="1" />
                <rect x="20" y="26" width="120" height="2" fill={secondaryColor} rx="0.5" opacity="0.8" />
              </>
            )}
            
            {/* Sections */}
            <rect x="20" y="45" width="40" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="52" width={w - 40} height="1" fill={primaryColor} opacity="0.3" />
            <rect x="20" y="60" width={w - 40} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="20" y="66" width={w - 60} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            <rect x="20" y="72" width={w - 50} height="2" fill={secondaryColor} opacity="0.5" rx="0.5" />
            
            <rect x="20" y="90" width="40" height="4" fill={primaryColor} rx="0.5" />
            <rect x="20" y="97" width={w - 40} height="1" fill={primaryColor} opacity="0.3" />
            <rect x="20" y="105" width="60" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <circle cx="23" cy="115" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="114" width={w - 50} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="123" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="122" width={w - 65} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="131" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="130" width={w - 55} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            
            <rect x="20" y="145" width="60" height="2" fill={secondaryColor} opacity="0.8" rx="0.5" />
            <circle cx="23" cy="155" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="154" width={w - 55} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
            <circle cx="23" cy="163" r="1.5" fill={secondaryColor} opacity="0.7" />
            <rect x="28" y="162" width={w - 70} height="2" fill={secondaryColor} opacity="0.6" rx="0.5" />
          </>
        );
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center p-2 transition-all ${isSelected ? 'scale-100' : 'group-hover:scale-[1.02]'}`}>
      <div className="w-full aspect-[210/297] rounded shadow-sm border border-black/5 overflow-hidden relative bg-white flex items-center justify-center max-w-[140px] mx-auto">
        <svg 
          viewBox={`0 0 ${w} ${h}`} 
          className="w-full h-full shadow-sm"
          style={{ backgroundColor: bgColor }}
        >
          {renderLayout()}
        </svg>
      </div>
    </div>
  );
}
