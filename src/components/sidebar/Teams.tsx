import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEnv } from '../../providers/EnvProvider';
import { Loader } from '../../commons/components/Loader';
import { AlertError } from '../../commons/components/AlertError';
import { Team } from '../teams/team';
import styles from './Teams.module.scss';
import { useTeamAdded, useTeamDeleted } from '../teams/live-teams';
import { Bubble } from '../../commons/components/Bubble';
import { axios } from '../../providers/axios';
import { AddSite } from '../sites/AddSite';
import { ButtonIcon } from '../../commons/components/ButtonIcon';
import { Sites } from './Sites';
import { useCurrentOrg } from '../../providers/OrgProvider';
import { useMountedState } from '../../commons/hooks/use-mounted-state';

function sortTeams(a: Team, b: Team) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function TeamSection({ team, className }: { team: Team; className? }) {
  return (
    <div className={className}>
      <div className={styles.linkHeader}>
        <NavLink
          className="d-flex align-items-center"
          to={`/teams/${team._id}`}
          activeClassName={styles.active}
        >
          <Bubble color={team.color} src={team.logo} />
          <span className="ml-2 text-uppercase">{team.name}</span>
        </NavLink>
        <div>
          <AddSite teamId={team._id}>
            <ButtonIcon>
              <FontAwesomeIcon icon={faPlus} />
            </ButtonIcon>
          </AddSite>
        </div>
      </div>
      <Sites teamId={team._id} />
    </div>
  );
}

export function Teams({ className }: { className? }) {
  const env = useEnv();
  const [loading, setLoading] = useMountedState(true);
  const [error, setError] = useState();
  const [teams, setItems] = useState<Team[]>();
  const teamsRef = useRef<Team[]>([]);
  const [addedTeam] = useTeamAdded();
  const [deletedTeam] = useTeamDeleted();
  const { currentOrg } = useCurrentOrg();

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    axios
      .get<Team[]>(`${env.MELI_API_URL}/api/v1/orgs/${currentOrg.org._id}/teams`)
      .then(({ data }) => {
        teamsRef.current = data;
        setItems(teamsRef.current.sort(sortTeams));
      })
      .catch(setError)
      .catch(err => toast(`Could not list teams: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  }, [env, currentOrg, setLoading]);

  useEffect(() => {
    if (addedTeam) {
      teamsRef.current = [addedTeam, ...teamsRef.current];
      setItems(teamsRef.current.sort(sortTeams));
    }
  }, [addedTeam]);

  useEffect(() => {
    if (deletedTeam) {
      teamsRef.current = (teamsRef.current || []).filter(({ _id }) => _id !== deletedTeam);
      setItems(teamsRef.current.sort(sortTeams));
    }
  }, [deletedTeam]);

  return loading ? (
    <Loader />
  ) : error ? (
    <AlertError error={error} />
  ) : (
    <div className={className}>
      {teams.length === 0 ? (
        <>
          No teams to show
        </>
      ) : (
        <>
          {teams.map(team => (
            <TeamSection
              team={team}
              key={team._id}
              className="mb-3"
            />
          ))}
        </>
      )}
    </div>
  );
}
