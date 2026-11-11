import { useAudit } from '../contexts/AuditContext';

export function useAuditState() {
  const audit = useAudit();
  return {
    ...audit,
    isLoaded: true,
  };
}

export default useAuditState;
