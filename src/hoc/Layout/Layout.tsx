import React from 'react';
import { Toolbar } from '../../components/Navigation/Toolbar/Toolbar';
import { UserInfo } from '../../interfaces/UserInfo';
import './Layout.css';


 interface LayoutProps {
  currentUser?: UserInfo |null;
  children: React.ReactElement;
}

export const Layout: React.FC<LayoutProps> = (layoutProps: LayoutProps) => {
  return (
    <React.Fragment>
      <Toolbar currentUser={layoutProps.currentUser} />

      <main className="Content">
        {layoutProps.children}
      </main>
    </React.Fragment>
  )
}




