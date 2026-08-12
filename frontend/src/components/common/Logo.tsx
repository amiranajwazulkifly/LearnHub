import { useThemeStore } from '../../store/useThemeStore';

interface LogoProps {
  className?: string;
}

function Logo({ className = 'h-8 w-auto' }: LogoProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <img
      src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
      alt="LearnHub"
      className={className}
    />
  );
}

export default Logo;
