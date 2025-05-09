import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: number;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 40, children, ...props }) => {
  return (
    <div
      {...props}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid var(--color-gold, #d4af37)',
        background: 'var(--color-cream, #f9f6f2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Cinzel Decorative, Raleway, serif',
        fontWeight: 700,
        fontSize: size * 0.45,
        color: 'var(--color-rich-black, #0a0a0a)',
        ...props.style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        children
      )}
    </div>
  );
};

interface AvatarFallbackProps {
  children: React.ReactNode;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => {
  return <span>{children}</span>;
};
