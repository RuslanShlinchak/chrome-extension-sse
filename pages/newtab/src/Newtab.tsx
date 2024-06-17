import '@src/Newtab.css';
import '@src/Newtab.scss';
import { withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { useEffect, useState } from 'react';

type Item = { value: string };

const Newtab = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      'https://stage.api.powerlead.com/api/v1/stream?token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImRmOGIxNTFiY2Q5MGQ1YjMwMjBlNTNhMzYyZTRiMzA3NTYzMzdhNjEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUnVzbGFuIFNobGluY2hhayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKamxLcU1ZcERFLTdmQ1RGQnQ0c2NJMVVUOVhNNENqWVFiS256dXJaWkE9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcG93ZXJsZWFkLWV4dGVuc2lvbi1zdGFnZSIsImF1ZCI6InBvd2VybGVhZC1leHRlbnNpb24tc3RhZ2UiLCJhdXRoX3RpbWUiOjE3MTgzNTg2NzEsInVzZXJfaWQiOiJ6OEZwdmRTblcwVExMRGUyRkdKb1VxVmFMS2YyIiwic3ViIjoiejhGcHZkU25XMFRMTERlMkZHSm9VcVZhTEtmMiIsImlhdCI6MTcxODYxMzg0MSwiZXhwIjoxNzE4NjE3NDQxLCJlbWFpbCI6InJ1c2xhbi5zaGxpbmNoYWtAc3luYy5haSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTE0MTc3ODY4Njc2MDMzNzk3MzcyIl0sImVtYWlsIjpbInJ1c2xhbi5zaGxpbmNoYWtAc3luYy5haSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.LefsU2RE4DKv94FTkxIncu-0sAhShGMSW8Lbsh0K9b16Qek2Ki4faLRQHFM9hxak-m_qH2zzdjMaZbGVqfQUpYuqg_9P2O15aG_nTRhGEtXZO_P3qZ4jdeHVoVBdi0ma6GEoQK9HwQwpBG5Qm4kyYNRYWWeL2GNfoRPpt2DG8aHG5HI2bQnHNuMjH22mF5m-9BkofOVqflKs4ptwN5vIHip7uRPMrZHrMzvya2Q-fH_85Xt8b8BWK6EBKFpiuuhW5ih5r-YwFaYdXIqOsCS0cXULKxZrLjFdoh78vCQcDIVd-PfOUAhtBN4pDj6zcRtDwf2QRQuI1hunMXXFFVtzaA&app_type=extension&app_version=2.2.2.0&exclude_entities=workspace_stat',
      {
        withCredentials: true,
      },
    );

    // const eventSource = new EventSource('http://localhost:3000/events', {
    //   withCredentials: true,
    // });

    eventSource.onmessage = (event: MessageEvent<string>): void => {
      try {
        const data = JSON.parse(event.data) as Item;
        setItems(prev => [...prev, data]);
      } catch (e) {
        console.error(e, 'Error parsing message');
      }
    };

    eventSource.onerror = (e): void => {
      console.error(e, 'EventSource failed');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="App" style={{ backgroundColor: '#eee' }}>
      {items.map((item, index) => {
        return <div key={index}>{item.event_type}</div>;
      })}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
