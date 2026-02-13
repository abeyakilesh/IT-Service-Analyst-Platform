const StatCard = ({ title, value, icon, trend, trendUp, color = 'blue' }) => {
    const colors = {
        blue: 'border-l-blue-500 bg-white dark:bg-slate-800',
        green: 'border-l-emerald-500 bg-white dark:bg-slate-800',
        yellow: 'border-l-amber-500 bg-white dark:bg-slate-800',
        red: 'border-l-red-500 bg-white dark:bg-slate-800',
        purple: 'border-l-purple-500 bg-white dark:bg-slate-800',
    };

    const iconColors = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
        yellow: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
        red: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <div className={`${colors[color]} border border-slate-200 dark:border-slate-700 border-l-4 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${iconColors[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
