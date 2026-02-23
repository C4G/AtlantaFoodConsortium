import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Project Peer Evaluations',
  description: 'Peer evaluations for the project',
};

export default function PeerEvaluationsPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>
        <Link
          href='https://gtvault-my.sharepoint.com/:w:/g/personal/tbahbouche3_gatech_edu/ETXg34o2-CdHs-f-qYgcibIBCa56zkpoyDHkpORU-YIckw?wdOrigin=TEAMS-WEB.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1741140896855&web=1'
          className='text-blue-600 underline'
        >
          Project Peer Evaluations
        </Link>
      </h1>
    </div>
  );
}
