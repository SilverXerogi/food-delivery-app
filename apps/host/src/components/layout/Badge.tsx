import React from 'react';
import { Badge } from 'antd';

const BadgeComponent: React.FC<{ count: number; children: React.ReactNode }> = ({ count, children }) => {
  return <Badge count={count}>{children}</Badge>;
};

export default BadgeComponent;
