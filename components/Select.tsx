import React from 'react';
import ReactSelect from 'react-select';

const controlStyles = {
  fontSize: 14,
  height: 30,
  minHeight: 30,
  background: 'transparent',
  borderRadius: 3,
  boxShadow: 'none',
  border: 'solid 1px #d0d1d9',

  '&:hover': {
    background: '#eeeeee',
  },
};

const itemStyles = (icons?: { [id: string]: string }) => {
  const sharedStyles = {
    fontSize: 14,
    display: 'flex',
  };

  if (icons) {
    return (styles: any, { data }: any) => ({
      ...styles,
      ...sharedStyles,
      ':before': {
        background: icons[data.value] ? `url('${icons[data.value]}')` : null,
        content: '""',
        display: 'block',
        marginRight: 8,
        height: 20,
        width: 20,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
      },
    });
  }
  return (styles: any) => ({
    ...styles,
    ...sharedStyles,
  });
};

interface SelectProps {
  options: { value: any; label: string }[];
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  searchable?: boolean;
  width: number;
  icons?: { [id: string]: string };
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  searchable,
  width,
  icons,
}) => {
  const [selected] = options.filter((option: any) => option.value === value);
  return (
    <ReactSelect
      options={options}
      value={selected}
      onChange={(val: any) => onChange(val.value)}
      placeholder={placeholder}
      isSearchable={searchable}
      styles={{
        control: (provided: any) => ({
          ...provided,
          ...controlStyles,
          width,
        }),
        dropdownIndicator: (provided: any) => ({
          ...provided,
          padding: 4,
        }),
        input: (provided: any) => ({
          ...provided,
          margin: '0 2px',
        }),
        singleValue: itemStyles(icons),
        option: itemStyles(icons),
      }}
    />
  );
};

export default Select;
