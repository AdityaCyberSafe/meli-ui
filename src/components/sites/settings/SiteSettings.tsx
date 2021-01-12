import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { NavPills } from '../../../commons/components/NavPills';
import { SettingsIcon } from '../../icons/SettingsIcon';
import { SecurityIcon } from '../../icons/SecurityIcon';
import { SecuritySettings } from './SecuritySettings';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { SiteLogo } from './SiteLogo';

function MainSettings() {
  return (
    <>
      <GeneralSettingsForm />
      <SiteLogo />
    </>
  );
}

export function SiteSettings() {
  const { path, url } = useRouteMatch();
  return (
    <>
      <div className="d-flex justify-content-end">
        <NavPills links={[
          {
            to: url,
            label: (
              <>
                <SettingsIcon className="mr-2" />
                {' '}
                General
              </>
            ),
            exact: true,
          },
          {
            to: `${url}/security`,
            label: (
              <>
                <SecurityIcon className="mr-2" />
                {' '}
                Security
              </>
            ),
          },
        ]}
        />
      </div>
      <Switch>
        <Route path={path} exact component={MainSettings} />
        <Route path={`${path}/security`} exact component={SecuritySettings} />
      </Switch>
    </>
  );
}
