import {
  FormProvider, useFieldArray, useForm,
} from 'react-hook-form';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './SiteSettings.module.scss';
import { Button } from '../../../commons/components/Button';
import { Site, SiteDomain } from '../site';
import { DomainForm } from './DomainForm';
import { SiteNameInput } from './SiteNameInput';
import { useEnv } from '../../../providers/EnvProvider';
import { useSite } from '../SiteView';
import { axios } from '../../../providers/axios';
import { COLOR_PATTERN, required } from '../../../commons/components/forms/form-constants';
import { InputError } from '../../../commons/components/forms/InputError';
import { useLoading } from '../../../commons/hooks/use-loading';
import { CopyToClipboard } from '../../../commons/components/CopyToClipboard';
import { SelectMainBranch } from './SelectMainBranch';

interface Settings {
  name: string;
  color: string;
  domains: SiteDomain[];
}

export function SiteSettings() {
  const env = useEnv();
  const { siteId } = useParams();
  const { site, setSite } = useSite();

  const methods = useForm<Settings>({
    mode: 'onChange',
  });
  const {
    errors, register, control, reset, handleSubmit, formState: { isDirty },
  } = methods;
  const domains = useFieldArray<SiteDomain>({
    control,
    name: 'domains',
  });

  useEffect(() => {
    if (site && reset) {
      reset(site);
    }
  }, [site, reset]);

  const [loading, setLoading] = useLoading(false);

  const onSubmit = (updatedSite: Settings) => {
    setLoading(true);
    axios
      .put<Site>(`${env.MELI_SERVER_URL}/api/v1/sites/${siteId}`, updatedSite)
      .then(({ data }) => data)
      .then(setSite)
      .then(() => toast('Site saved', {
        type: 'success',
      }))
      .catch(err => toast(`Could not update site: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
      >

        <div className="form-group d-flex justify-content-end">
          {/* TODO use http://reactcommunity.org/react-transition-group/css-transition */}
          {isDirty && (
            <button
              type="button"
              className="btn btn-outline-primary animate fadeIn"
              onClick={() => reset(site)}
            >
              Discard
            </button>
          )}
          <Button
            type="submit"
            className="ml-3 btn btn-primary"
            loading={loading}
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>

        <div className="mt-4 card">
          <div className="card-header no-border d-flex justify-content-between">
            <strong>Site ID</strong>
            <CopyToClipboard value={site._id}>
              <code>{site._id}</code>
            </CopyToClipboard>
          </div>
        </div>

        <div className="mt-4 card">
          <div className="card-header">
            <strong>Site</strong>
          </div>
          <div className="card-body">
            <SiteNameInput previousName={site.name} />
            <div className="form-group">
              <label htmlFor="color" className="form-label">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                ref={register({
                  required,
                  pattern: COLOR_PATTERN,
                })}
                className="form-control"
                autoComplete="off"
                defaultValue="#000000"
              />
              <InputError error={errors} path="color" />
            </div>
          </div>
        </div>

        <div className="mt-4 card">
          <div className="card-header">
            <strong>Domains</strong>
          </div>
          <div className="card-body">
            <div className={styles.domains}>
              {domains.fields.map((item, index) => (
                <DomainForm
                  key={item.id}
                  item={item as SiteDomain}
                  index={index}
                  remove={() => domains.remove(index)}
                />
              ))}
              <button
                type="button"
                className={classNames('mt-3', styles.add)}
                onClick={() => domains.append({})}
              >
                Add domain
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 card">
          <div className="card-header no-border d-flex justify-content-between">
            <strong>Main branch</strong>
            <SelectMainBranch siteId={siteId} />
          </div>
        </div>

      </form>
    </FormProvider>
  );
}
