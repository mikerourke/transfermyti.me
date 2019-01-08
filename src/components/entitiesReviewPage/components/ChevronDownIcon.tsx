import React from 'react';

const ChevronDownIcon: React.FunctionComponent = () => (
  <svg viewBox="0 0 448 512" height={16} width={16} fill="var(--dark-gray)">
    <path
      d={`
        M207.029 381.476
        L12.686 187.132
        c-9.373-9.373-9.373-24.569 0-33.941
        l22.667-22.667
        c9.357-9.357 24.522-9.375 33.901-.04
        L224 284.505
        l154.745-154.021
        c9.379-9.335 24.544-9.317 33.901.04
        l22.667 22.667
        c9.373 9.373 9.373 24.569 0 33.941
        L240.971 381.476
        c-9.373 9.372-24.569 9.372-33.942 0z
      `}
    />
  </svg>
);

export default ChevronDownIcon;
