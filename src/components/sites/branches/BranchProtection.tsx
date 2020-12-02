import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Toggle } from '../../../commons/components/forms/Toggle';
import { CardModal } from '../../../commons/components/modals/CardModal';
import { Branch } from './branch';
import { Button } from '../../../commons/components/Button';
import { InputError } from '../../../commons/components/forms/InputError';
import { maxLength, required } from '../../../commons/components/forms/form-constants';
import { useEnv } from '../../../providers/EnvProvider';
import { axios } from '../../../providers/axios';
import { randomString } from '../../../commons/utils/random-string';

interface FormData {
  password: string;
}

export function BranchProtection({
  siteId, branch, onChange, className,
}: {
  siteId: string;
  branch: Branch;
  onChange: (branch: Branch) => void;
  className?;
}) {
  const [randomSecret, setRandomSecret] = useState(randomString(16));

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    setRandomSecret(randomString(16));
  }, [isOpen]);

  const {
    register, errors, handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const env = useEnv();
  const [loading, setLoading] = useState(false);

  const setPassword = (formData: FormData) => {
    setLoading(true);
    axios
      .put<Branch>(`${env.MELI_SERVER_URL}/api/v1/sites/${siteId}/branches/${branch._id}/password`, formData)
      .then(({ data }) => {
        onChange(data);
        closeModal();
      })
      .catch(err => {
        toast(`Could not rename branch: ${err}`, {
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  const removePassword = () => {
    setLoading(true);
    axios
      .delete<Branch>(`${env.MELI_SERVER_URL}/api/v1/sites/${siteId}/branches/${branch._id}/password`)
      .then(({ data }) => onChange(data))
      .catch(err => {
        toast(`Could not rename branch: ${err}`, {
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Toggle
        value={!!branch.hasPassword}
        onChange={() => (branch.hasPassword ? removePassword() : openModal())}
        loading={branch.hasPassword && loading}
        className={className}
      >
        protected
      </Toggle>
      <CardModal isOpen={isOpen} closeModal={closeModal} title="Set branch password">
        <form onSubmit={handleSubmit(setPassword)}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="text"
              id="password"
              name="password"
              ref={register({
                required,
                maxLength: maxLength(),
              })}
              className="form-control"
              placeholder="please-let-me-in"
              autoComplete="off"
              defaultValue={randomSecret}
            />
            <InputError error={errors} path="password" />
          </div>
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              className="btn btn-primary"
              loading={loading && !branch.hasPassword}
            >
              Save
            </Button>
          </div>
        </form>
      </CardModal>
    </>
  );
}
