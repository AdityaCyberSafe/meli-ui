import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import classNames from 'classnames';
import { Toggle } from '../../../commons/components/forms/Toggle';
import { ManualSslConfiguration, SiteDomain } from '../site';
import styles from './DomainForm.module.scss';
import { maxLength, required } from '../../../commons/components/forms/form-constants';
import { InputError } from '../../../commons/components/forms/InputError';

type SslConfigurationType = SiteDomain['sslConfiguration']['type'];

function Config({
  sslType, input, item,
}: { sslType: SslConfigurationType; input: string; item: SiteDomain }) {
  switch (sslType) {
    case 'manual':
      return <ManualConfig input={input} item={item} />;
    default:
      return <></>;
  }
}

export function ManualConfig({ input, item }: { input: string; item: SiteDomain }) {
  const { register, errors } = useFormContext();

  const sslFullchain = `${input}.sslConfiguration.fullchain`;
  const sslPrivateKey = `${input}.sslConfiguration.privateKey`;

  return (
    <>
      <div className="form-row d-flex align-items-center">
        <div className="form-group">
          <label htmlFor={sslFullchain}>Certificate (and chain):</label>
          <textarea
            name={sslFullchain}
            id={sslFullchain}
            ref={register()}
            defaultValue={(item.sslConfiguration as ManualSslConfiguration)?.fullchain}
            className="form-control"
          />
          <InputError error={errors} path={sslFullchain} />
        </div>
      </div>
      <div className="form-row d-flex align-items-center">
        <div className="form-group">
          <label htmlFor={sslPrivateKey}>Private key:</label>
          <textarea
            name={sslPrivateKey}
            id={sslPrivateKey}
            ref={register()}
            defaultValue={(item.sslConfiguration as ManualSslConfiguration)?.privateKey}
            className="form-control"
          />
          <InputError error={errors} path={sslPrivateKey} />
        </div>
      </div>
      <hr />
    </>
  );
}

export function DomainForm({
  item, index, remove,
}: {
  item: SiteDomain;
  index: number;
  remove: () => void;
}) {
  const {
    register, errors, getValues, control, watch,
  } = useFormContext();

  const input = `domains[${index}]`;
  const nameInput = `${input}.name`;
  const sslTypeToggle = `${input}.sslConfiguration.type`;

  const sslType = watch(sslTypeToggle);

  return (
    <div className={classNames(styles.notification)}>
      <div className="form-row d-flex align-items-center">
        <div className="form-group flex-grow-1 col">
          <input
            type="text"
            id={nameInput}
            name={nameInput}
            ref={register({
              required,
              maxLength: maxLength(),
              validate: value => {
                const domains: SiteDomain[] = getValues().domains || [];
                const domainsWithSameName = domains.filter(({ name }) => name === value);
                return domainsWithSameName.length > 1 ? 'Duplicate domain' : undefined;
              },
            })}
            className="form-control"
            placeholder="docs.domain.com"
            defaultValue={item.name}
          />
          <InputError error={errors} path={nameInput} />
        </div>
        <div className="form-group flex-grow-0 flex-shrink-0 ml-2 mr-2">
          <Controller
            control={control}
            name={sslTypeToggle}
            render={({ value, onChange }) => (
              <Toggle value={value === 'acme'} onChange={auto => onChange(auto ? 'acme' : 'manual')}>
                Automatic SSL (ACME)
              </Toggle>
            )}
            defaultValue={item?.sslConfiguration?.type ?? 'acme'}
          />
        </div>
        <div className="form-group col flex-grow-0">
          <button type="button" className="btn btn-danger" onClick={() => remove()}>
            Delete
          </button>
        </div>
      </div>
      <Config sslType={sslType} input={input} item={item} />
    </div>
  );
}
