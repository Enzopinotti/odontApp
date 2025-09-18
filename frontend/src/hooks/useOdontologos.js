// src/hooks/useMiOdontologo.js
import { useEffect, useState } from "react";
import { getOdontologoById } from "../utils/odontologoApi";
import useAuth from "../features/auth/hooks/useAuth";
export function useMiOdontologo() {
  const [odontologo, setOdontologo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user}=useAuth()

  useEffect(() => {
    const fetchMiOdontologo = async () => {
      try {
        setLoading(true);

        if (user?.id) {
          const data = await getOdontologoById(user.id);
          setOdontologo(data.data);
        } else {
          setOdontologo(null);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMiOdontologo();
  }, [user]);

  return { odontologo, loading, error };
}
