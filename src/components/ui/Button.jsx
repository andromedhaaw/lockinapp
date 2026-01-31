import PropTypes from 'prop-types';

const variants = {
  primary: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

/**
 * Reusable button component with variants
 */
export const Button = ({
  children,
  variant = 'primary',
  className = '',
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={`
        font-semibold py-4 px-6 rounded-2xl shadow-lg 
        transition-all duration-200 
        flex items-center justify-center gap-2 
        active:scale-95
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'warning', 'danger']),
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};
