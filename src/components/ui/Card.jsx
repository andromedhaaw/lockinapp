import PropTypes from 'prop-types';

const variants = {
  default: 'bg-white dark:bg-slate-900 border-green-100 dark:border-slate-800',
  highlight: 'bg-green-50 border-green-200',
};

/**
 * Reusable card container component
 */
export const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl shadow-[0_1px_2px_rgba(34,51,39,0.035)] p-6 border
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'highlight']),
  className: PropTypes.string,
};
