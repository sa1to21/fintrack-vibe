import * as React from 'react';
import RU from 'country-flag-icons/react/3x2/RU';
import US from 'country-flag-icons/react/3x2/US';
import EU from 'country-flag-icons/react/3x2/EU';
import GB from 'country-flag-icons/react/3x2/GB';
import CN from 'country-flag-icons/react/3x2/CN';
import JP from 'country-flag-icons/react/3x2/JP';
import KZ from 'country-flag-icons/react/3x2/KZ';
import UA from 'country-flag-icons/react/3x2/UA';
import BY from 'country-flag-icons/react/3x2/BY';
import GE from 'country-flag-icons/react/3x2/GE';
import TR from 'country-flag-icons/react/3x2/TR';
import AE from 'country-flag-icons/react/3x2/AE';
import TH from 'country-flag-icons/react/3x2/TH';

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

const FLAGS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  RU, US, EU, GB, CN, JP, KZ, UA, BY, GE, TR, AE, TH
};

export function FlagIcon({ countryCode, className = '' }: FlagIconProps) {
  const FlagComponent = FLAGS[countryCode];

  if (!FlagComponent) {
    console.warn(`Flag not found for country code: ${countryCode}`);
    return null;
  }

  return (
    <FlagComponent
      className={`inline-block ${className}`}
      style={{ width: '1.25em', height: '0.9em', verticalAlign: 'middle' }}
    />
  );
}
