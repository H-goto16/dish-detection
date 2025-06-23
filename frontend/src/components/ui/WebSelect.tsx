import useColorScheme from '@/hooks/useColorScheme';

type Item = {
  label: string;
  value: string;
};

type WebSelectProps = {
  items: Item[];
  value: string | null;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
};

const WebSelect = ({ items, value, onChange, placeholder }: WebSelectProps) => {
  const colors = useColorScheme();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '90%',
          padding: '8px',
          backgroundColor: colors.background,
          color: colors.text,
          border: `1px solid ${colors.tint}`,
          borderRadius: '10px',
        }}
      >
        <option value='' disabled>
          {placeholder}
        </option>
        {items.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type='button'
        onClick={() => onChange(undefined)}
        style={{
          position: 'absolute',
          right: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: colors.text,
          cursor: 'pointer',
          padding: '4px',
          fontSize: '30px',
          width: '24px',
          height: '24px',
          display: value ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = `${colors.tint}20`;
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onFocus={e => {
          e.currentTarget.style.backgroundColor = `${colors.tint}20`;
        }}
        onBlur={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default WebSelect;
