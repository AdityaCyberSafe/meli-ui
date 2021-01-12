import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uniqueId } from 'lodash';
import { useEnv } from '../../providers/EnvProvider';
import { Loader } from '../../commons/components/Loader';
import { EmptyList } from '../../commons/components/EmptyList';
import { AlertError } from '../../commons/components/AlertError';
import { Team } from './team';
import { PaginationData } from '../../commons/components/Pagination';
import { LoadMore } from '../../commons/components/LoadMore';
import { axios } from '../../providers/axios';
import { useTeamAdded } from './live-teams';
import { TeamIcon } from '../icons/TeamIcon';
import { Bubble } from '../../commons/components/Bubble';
import { FromNow } from '../../commons/components/FromNow';
import { AddTeam } from './AddTeam';
import { useCurrentOrg } from '../../providers/OrgProvider';
import { useMountedState } from '../../commons/hooks/use-mounted-state';

export function TeamList() {
  const env = useEnv();
  const { currentOrg } = useCurrentOrg();
  const [loading, setLoading] = useMountedState(true);
  const [error, setError] = useState();
  const [items, setItems] = useState<Team[]>();
  const itemsRef = useRef<Team[]>([]);
  const [pagination, setPagination] = useState<PaginationData>();
  const [addedTeam] = useTeamAdded();

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    axios
      .get<Team[]>(`${env.MELI_API_URL}/api/v1/orgs/${currentOrg.org._id}/teams`)
      .then(({ data }) => {
        itemsRef.current.push(...data);
        setItems(itemsRef.current);
      })
      .catch(setError)
      .catch(err => toast(`Could not list repos: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  }, [env, pagination, currentOrg, setLoading]);

  useEffect(() => {
    if (addedTeam) {
      setItems([addedTeam, ...itemsRef.current]);
    }
  }, [addedTeam]);

  const nextPage = () => {
    setPagination({
      ...pagination,
      page: pagination.page + 1,
    });
  };

  const emptyList = (
    <EmptyList
      icon={<TeamIcon />}
      title="No teams"
    >
      <AddTeam>
        <button type="button" className="btn btn-primary d-block">
          Add team
        </button>
      </AddTeam>
    </EmptyList>
  );

  return loading ? (
    <Loader />
  ) : error ? (
    <AlertError error={error} />
  ) : (
    <div className="mt-5" key={uniqueId()}>
      {items.length === 0 ? (
        emptyList
      ) : (
        <>
          <h2>Teams</h2>
          <ul className="list-group">
            {items.map(team => (
              <Link to={`/teams/${team._id}`} className="d-block" key={team._id}>
                <li className="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Bubble color={team.color} src={team.logo} />
                    <span className="ml-2">{team.name}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FromNow date={team.createdAt} label="Created" />
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </>
      )}
      {pagination && (
        <LoadMore
          onClick={nextPage}
          loading={loading}
          disabled={loading}
        />
      )}
    </div>
  );
}
