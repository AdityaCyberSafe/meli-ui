import React, {
  useEffect, useRef, useState,
} from 'react';
import { toast } from 'react-toastify';
import { getMembers, OrgMembersSearchQuery } from '../../../orgs/staff/members/get-members';
import { OrgMember } from '../../../orgs/staff/members/org-member';
import { useEnv } from '../../../../providers/EnvProvider';
import { CardModal } from '../../../../commons/components/modals/CardModal';
import { SearchInput } from '../../../sites/releases/SearchInput';
import { LoadMore } from '../../../../commons/components/LoadMore';
import { Loader } from '../../../../commons/components/Loader';
import { AlertError } from '../../../../commons/components/AlertError';
import styles from './AddMember.module.scss';
import { ListItem } from './ListItem';
import { useCurrentOrg } from '../../../../providers/OrgProvider';
import { useLoading } from '../../../../commons/hooks/use-loading';

export function AddMember({
  teamId, className, children, onAdded,
}: {
  teamId: string;
  children: any;
  className?: string;
  onAdded: (member: OrgMember) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const env = useEnv();
  const { currentOrg } = useCurrentOrg();
  const [loading, setLoading] = useLoading(false);
  const [error, setError] = useState();
  const [query, setQuery] = useState<OrgMembersSearchQuery>({
    search: '', page: 0, size: 10,
  });
  const [items, setItems] = useState<OrgMember[]>([]);
  const itemsRef = useRef<OrgMember[]>([]);
  const [canLoadMore, setCanLoadMore] = useState(false);

  useEffect(() => {
    setError(undefined);
    setLoading(true);
    getMembers(env, currentOrg.org._id, query)
      .then(data => {
        itemsRef.current = [...itemsRef.current, ...data.items];
        setItems(itemsRef.current);
        setCanLoadMore(itemsRef.current.length !== data.count);
      })
      .catch(setError)
      .catch(err => {
        toast(`Could not search releases: ${err}`, {
          type: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });
  }, [env, currentOrg, query, setLoading]);

  const nextPage = () => {
    setQuery({
      ...query,
      page: query.page + 1,
    });
  };

  const onSelected = (member: OrgMember) => {
    setIsOpen(false);
    onAdded(member);
  };

  const onSearch = val => {
    itemsRef.current = [];
    setQuery({
      ...query, search: val, page: 0,
    });
  };

  return (
    <>
      <CardModal
        isOpen={isOpen}
        title="Delete branch"
        closeModal={() => setIsOpen(false)}
        className={styles.modal}
      >
        <SearchInput
          search={query.search}
          setSearch={onSearch}
          loading={loading}
          className="mb-4"
        />
        {initialLoad ? (
          <Loader />
        ) : error ? (
          <AlertError error={error} />
        ) : (
          <ul className="list-group">
            {items.map(item => (
              <ListItem
                key={item._id}
                member={item}
                teamId={teamId}
                onAdded={() => onSelected(item)}
              />
            ))}
            {canLoadMore && (
              <LoadMore
                onClick={nextPage}
                loading={loading}
                disabled={loading}
              />
            )}
          </ul>
        )}
      </CardModal>
      <div onClick={() => setIsOpen(true)} className={className}>
        {children}
      </div>
    </>
  );
}
