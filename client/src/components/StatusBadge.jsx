const StatusBadge = ({ status }) => {
    const styles = {
        open: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        resolved: 'bg-green-500/10 text-green-400 border-green-500/30',
    };

    const labels = {
        open: 'Open',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-500/10 text-slate-400'}`}>
            {labels[status] || status}
        </span>
    );
};

export default StatusBadge;
