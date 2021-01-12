import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { useEnv } from '../../providers/EnvProvider';
import { Loader } from '../../commons/components/Loader';
import { AlertError } from '../../commons/components/AlertError';
import { getTeamSites } from '../sites/get-team-sites';
import { Site } from '../sites/site';
import styles from './Sites.module.scss';
import { useSiteAdded, useSiteDeleted } from '../sites/live-site';
import { Bubble } from '../../commons/components/Bubble';
import { useMountedState } from '../../commons/hooks/use-mounted-state';

function sortSites(a: Site, b: Site) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function Sites({ teamId, className }: { teamId; className? }) {
  const env = useEnv();
  const [loading, setLoading] = useMountedState(true);
  const [error, setError] = useState();
  const [sites, setItems] = useState<Site[]>();
  const sitesRef = useRef<Site[]>([]);
  const [addedSite] = useSiteAdded();
  const [deletedSite] = useSiteDeleted();

  // TODO pagination ?
  useEffect(() => {
    setLoading(true);
    setError(undefined);
    getTeamSites(env, teamId, '', {
      page: 0, size: 100,
    })
      .then(({ items, count }) => {
        sitesRef.current = items;
        setItems(sitesRef.current.sort(sortSites));
      })
      .catch(setError)
      .catch(err => toast(`Could not list sites: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  }, [env, teamId, setLoading]);

  useEffect(() => {
    if (addedSite && teamId === addedSite.teamId) {
      sitesRef.current = [addedSite, ...sitesRef.current];
      setItems(sitesRef.current.sort(sortSites));
    }
  }, [addedSite, teamId]);

  useEffect(() => {
    if (deletedSite) {
      sitesRef.current = (sitesRef.current || []).filter(({ _id }) => _id !== deletedSite);
      setItems(sitesRef.current.sort(sortSites));
    }
  }, [deletedSite]);

  const emptyList = (
    <div className="text-muted ml-4">
      No sites to show
    </div>
  );

  return loading ? (
    <Loader />
  ) : error ? (
    <AlertError error={error} />
  ) : (
    <div className={classNames(className)}>
      <div>
        {sites.length === 0 ? (
          emptyList
        ) : (
          sites.map(site => (
            <NavLink
              key={site._id}
              to={`/sites/${site._id}`}
              className={styles.site}
              activeClassName={styles.active}
            >
              <Bubble color={site.color} src={site.logo} />
              <span className="ml-2">{site.name}</span>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
}
