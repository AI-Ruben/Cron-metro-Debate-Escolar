import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, Team, TimerState, Timers, TimerLog, TimerLogs } from './types';
import { TRANSLATIONS, TIMER_CONFIGS } from './constants';

const formatTime = (totalSeconds: number): string => {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = isNegative ? '-' : '';
  return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const Header: React.FC<{
  lang: Language;
  setLang: (lang: Language) => void;
  translations: typeof TRANSLATIONS[Language];
}> = ({ lang, setLang, translations }) => {
  const languages: Language[] = ['es', 'en', 'eu'];

  return (
    <header className="text-center bg-white p-5 rounded-2xl mb-8 shadow-lg max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-[#5B4A9E] mb-2 tracking-wide">{translations.mainTitle}</h1>
      <h2 className="text-2xl md:text-3xl font-normal text-[#4A9E9E] mb-4">{translations.subtitle}</h2>
      <div className="flex justify-center gap-2 mt-4">
        {languages.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-5 py-2 rounded-md font-bold text-white transition-all duration-300 transform hover:scale-105 ${
              lang === l ? 'bg-[#4A9E9E]' : 'bg-[#5B4A9E] hover:bg-[#4A9E9E]'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
};

const ConfigPanel: React.FC<{
  onStart: (teamA: string, teamB: string) => void;
  translations: typeof TRANSLATIONS[Language];
}> = ({ onStart, translations }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');

  const handleStart = () => {
    if (teamA.trim() && teamB.trim()) {
      onStart(teamA.trim(), teamB.trim());
    } else {
      alert(translations.enterNames);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-[#5B4A9E] mb-6 text-center">{translations.configTitle}</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col">
          <label className="text-lg font-bold text-[#5B4A9E] mb-2">{translations.labelTeamA}</label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder={translations.placeholderA}
            className="p-3 border-2 border-[#5B4A9E] rounded-md focus:ring-2 focus:ring-[#4A9E9E] focus:outline-none transition"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold text-[#5B4A9E] mb-2">{translations.labelTeamB}</label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder={translations.placeholderB}
            className="p-3 border-2 border-[#5B4A9E] rounded-md focus:ring-2 focus:ring-[#4A9E9E] focus:outline-none transition"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-gradient-to-r from-[#5B4A9E] to-[#4A9E9E] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          {translations.startDebate}
        </button>
      </div>
    </div>
  );
};

const SummaryScreen: React.FC<{
  timerLogs: TimerLogs;
  teamNames: { A: string; B: string };
  translations: typeof TRANSLATIONS[Language];
  onExport: () => void;
  onReset: () => void;
}> = ({ timerLogs, teamNames, translations, onExport, onReset }) => {
  const renderTeamResults = (team: Team) => {
    const teamConfigs = TIMER_CONFIGS.filter(c => c.team === team);
    const totalTimeUsed = teamConfigs.reduce((sum, config) => sum + timerLogs[config.id].timeUsed, 0);
    const totalOvertime = teamConfigs.reduce((sum, config) => sum + timerLogs[config.id].overtime, 0);

    return (
      <div className="flex-1 bg-gray-50 p-4 md:p-6 rounded-xl shadow-md min-w-[280px]">
        <h3 className="text-2xl font-bold text-[#5B4A9E] mb-4 text-center">{teamNames[team]}</h3>
        <div className="space-y-3">
          {teamConfigs.map(config => {
            const log = timerLogs[config.id];
            return (
              <div key={config.id} className="p-3 bg-white rounded-lg shadow-sm">
                <p className="font-bold text-gray-700">{translations[config.id as keyof typeof translations]}</p>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">{translations.timeUsed}:</span>
                  <span className="font-mono font-semibold">{formatTime(log.timeUsed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{translations.overtime}:</span>
                  <span className={`font-mono font-semibold ${log.overtime > 0 ? 'text-red-500' : ''}`}>{formatTime(log.overtime)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#5B4A9E]">
            <div className="flex justify-between font-bold text-lg">
                <span>{translations.totalTime}:</span>
                <span className="font-mono">{formatTime(totalTimeUsed)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
                <span>{translations.totalOvertime}:</span>
                <span className={`font-mono ${totalOvertime > 0 ? 'text-red-500' : ''}`}>{formatTime(totalOvertime)}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl md:text-4xl text-center font-bold text-[#5B4A9E] mb-8">{translations.debateResults}</h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
          {renderTeamResults('A')}
          {renderTeamResults('B')}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={onExport} className="px-8 py-4 bg-[#6080A3] hover:bg-[#4d6782] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            {translations.export}
          </button>
          <button onClick={onReset} className="px-8 py-4 bg-gradient-to-r from-[#5B4A9E] to-[#4A9E9E] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            {translations.newDebate}
          </button>
        </div>
      </div>
    </main>
  );
};


const initialTimersState = TIMER_CONFIGS.reduce((acc, config) => {
  acc[config.id] = {
    seconds: config.defaultMinutes * 60,
    initialSeconds: config.defaultMinutes * 60,
    warningSeconds: config.defaultWarning,
    isRunning: false,
  };
  return acc;
}, {} as Timers);

const initialTimerLogsState = TIMER_CONFIGS.reduce((acc, config) => {
  acc[config.id] = {
    phase: config.id,
    team: config.team,
    initialTime: config.defaultMinutes * 60,
    timeUsed: 0,
    overtime: 0,
    completed: false
  };
  return acc;
}, {} as TimerLogs);


const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [debateStarted, setDebateStarted] = useState(false);
  const [debateFinished, setDebateFinished] = useState(false);
  const [teamNames, setTeamNames] = useState<{ A: string; B: string }>({ A: '', B: '' });
  const [activeTimerId, setActiveTimerId] = useState<string>(TIMER_CONFIGS[0].id);
  
  const [timers, setTimers] = useState<Timers>(initialTimersState);
  const [timerLogs, setTimerLogs] = useState<TimerLogs>(initialTimerLogsState);

  const translations = useMemo(() => TRANSLATIONS[lang], [lang]);
  const isAnyTimerRunning = useMemo(() => Object.keys(timers).some(key => timers[key].isRunning), [timers]);

  const handleStartDebate = useCallback((teamA: string, teamB: string) => {
    setTeamNames({ A: teamA, B: teamB });
    setDebateStarted(true);
  }, []);

  const handleFinishDebate = () => {
    setTimers(prev => {
      const newTimers = { ...prev };
      for (const id in newTimers) {
        newTimers[id].isRunning = false;
      }
      return newTimers;
    });
    setDebateFinished(true);
  };

  const handleResetApp = () => {
    setDebateStarted(false);
    setDebateFinished(false);
    setTeamNames({ A: '', B: '' });
    setActiveTimerId(TIMER_CONFIGS[0].id);
    setTimers(initialTimersState);
    setTimerLogs(initialTimerLogsState);
  };

  const updateTimerAndLog = useCallback((timerId: string, newSeconds: number) => {
    const timer = timers[timerId];
    const initialSeconds = timer.initialSeconds;
    
    let timeUsed = 0;
    let overtime = 0;

    if(newSeconds >= 0){
      timeUsed = initialSeconds - newSeconds;
    } else {
      timeUsed = initialSeconds;
      overtime = Math.abs(newSeconds);
    }

    setTimers(prev => ({
      ...prev,
      [timerId]: { ...prev[timerId], seconds: newSeconds }
    }));

    setTimerLogs(prev => ({
      ...prev,
      [timerId]: { ...prev[timerId], timeUsed, overtime }
    }));

    if (newSeconds === 0) {
      alert(`${translations.timeFinished} ${teamNames[TIMER_CONFIGS.find(c => c.id === timerId)!.team]}!`);
      setTimerLogs(prev => ({...prev, [timerId]: {...prev[timerId], completed: true }}));
    }
  }, [timers, teamNames, translations.timeFinished]);

  useEffect(() => {
    if (!isAnyTimerRunning) return;

    const interval = setInterval(() => {
      for (const id in timers) {
        if (timers[id].isRunning) {
          updateTimerAndLog(id, timers[id].seconds - 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyTimerRunning, updateTimerAndLog]); // updateTimerAndLog is memoized
  
  const handleTimerControl = useCallback((id: string, action: 'start' | 'pause' | 'reset') => {
    setTimers(prev => {
      const newTimers = { ...prev };
      Object.keys(newTimers).forEach(timerId => {
        if (timerId !== id) {
            newTimers[timerId].isRunning = false;
        }
      });

      if (action === 'start') {
        newTimers[id] = { ...newTimers[id], isRunning: true };
      } else if (action === 'pause') {
        newTimers[id] = { ...newTimers[id], isRunning: false };
      } else if (action === 'reset') {
        newTimers[id] = { ...newTimers[id], seconds: newTimers[id].initialSeconds, isRunning: false };
        setTimerLogs(prevLogs => ({ ...prevLogs, [id]: { ...prevLogs[id], timeUsed: 0, overtime: 0, completed: false } }));
      }
      return newTimers;
    });
  }, []);
  
  const handleTimeSettingChange = useCallback((id: string, type: 'initial' | 'warning', value: number) => {
    setTimers(prev => {
        const newTimerState = {...prev[id]};
        if(type === 'initial') {
            newTimerState.initialSeconds = value * 60;
            if(!newTimerState.isRunning) {
                newTimerState.seconds = value * 60;
            }
            setTimerLogs(prevLogs => ({ ...prevLogs, [id]: { ...prevLogs[id], initialTime: value * 60 } }));
        } else {
            newTimerState.warningSeconds = value;
        }
        return { ...prev, [id]: newTimerState };
    });
  }, []);

  const exportToCSV = useCallback(() => {
    const now = new Date();
    const timestamp = now.toLocaleString(lang);
    let csv = `Fase,Equipo/Participante,Tiempo Inicial (seg),Tiempo Usado (seg),Tiempo Extra (seg),${translations.completed}\n`;

    TIMER_CONFIGS.forEach(config => {
      const log = timerLogs[config.id];
      const phaseName = translations[config.id as keyof typeof translations];
      const teamName = teamNames[config.team];
      const completed = log.completed ? translations.yes : translations.no;
      csv += `"${phaseName}","${teamName}",${log.initialTime},${log.timeUsed},${log.overtime},"${completed}"\n`;
    });
    
    csv += '\n';

    (['A', 'B'] as Team[]).forEach(team => {
        const teamName = teamNames[team];
        const teamTimers = TIMER_CONFIGS.filter(c => c.team === team);
        const totalTime = teamTimers.reduce((sum, config) => sum + timerLogs[config.id].timeUsed, 0);
        const totalOvertime = teamTimers.reduce((sum, config) => sum + timerLogs[config.id].overtime, 0);
        csv += `"TOTAL ${teamName}","${teamName}",,${totalTime},${totalOvertime},\n`;
    });

    csv += `\n"Fecha/Hora","${timestamp}"\n`;
    csv += `"Idioma","${lang.toUpperCase()}"\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `cronometro_debate_${now.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }, [timerLogs, teamNames, lang, translations]);

  const activeTimer = timers[activeTimerId];
  const activeConfig = TIMER_CONFIGS.find(c => c.id === activeTimerId)!;
  
  const getTimerDisplayClass = (timer: TimerState) => {
    if (timer.seconds < 0) return 'text-red-600 animate-pulse';
    if (timer.seconds > 0 && timer.seconds <= timer.warningSeconds) return 'text-yellow-500';
    return 'text-[#4A9E9E]';
  };

  const getProgressBarClass = (timer: TimerState) => {
    if (timer.seconds <= 0) return 'bg-red-500';
    if (timer.seconds <= timer.warningSeconds) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const progressPercentage = useMemo(() => {
    if (activeTimer.initialSeconds <= 0) return 0;
    return Math.max(0, (activeTimer.seconds / activeTimer.initialSeconds) * 100);
  }, [activeTimer.seconds, activeTimer.initialSeconds]);

  return (
    <div className="bg-gradient-to-br from-[#5B4A9E] to-[#4A9E9E] min-h-screen p-4 md:p-8 text-gray-800">
      <Header lang={lang} setLang={setLang} translations={translations} />
      {!debateStarted ? (
        <ConfigPanel onStart={handleStartDebate} translations={translations} />
      ) : !debateFinished ? (
        <main className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {TIMER_CONFIGS.map(config => (
                    <button 
                        key={config.id} 
                        onClick={() => setActiveTimerId(config.id)}
                        className={`px-4 py-2 text-sm md:text-base font-bold rounded-lg border-2 transition-all duration-300 ${activeTimerId === config.id ? 'bg-gradient-to-r from-[#5B4A9E] to-[#4A9E9E] text-white border-transparent' : 'bg-white text-[#5B4A9E] border-[#5B4A9E] hover:bg-[#5B4A9E] hover:text-white'}`}
                    >
                        {translations[config.id as keyof typeof translations]}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl text-center font-bold text-[#5B4A9E]">{translations[activeConfig.id as keyof typeof translations]}</h2>
                <p className="text-xl text-center font-semibold italic text-[#4A9E9E] mb-4">{teamNames[activeConfig.team]}</p>
                
                <div className={`text-8xl md:text-9xl text-center font-bold my-8 transition-colors duration-300 ${getTimerDisplayClass(activeTimer)}`} style={{fontVariantNumeric: 'tabular-nums'}}>
                    {formatTime(activeTimer.seconds)}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-6 mb-8 overflow-hidden shadow-inner">
                    <div
                        className={`h-6 rounded-full transition-all duration-300 ease-linear ${getProgressBarClass(activeTimer)}`}
                        style={{ width: `${progressPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={activeTimer.seconds}
                        aria-valuemin={0}
                        aria-valuemax={activeTimer.initialSeconds}
                        aria-label="Time remaining"
                    ></div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8 text-[#5B4A9E]">
                    <div className="flex items-center gap-3">
                        <label className="font-bold text-lg whitespace-nowrap">{translations.initialMinutes}</label>
                        <input type="number" value={Math.round(activeTimer.initialSeconds / 60)} onChange={(e) => handleTimeSettingChange(activeTimerId, 'initial', parseInt(e.target.value))} min="1" max="60" className="w-20 p-2 text-center border-2 border-[#5B4A9E] rounded-md"/>
                    </div>
                     <div className="flex items-center gap-3">
                        <label className="font-bold text-lg whitespace-nowrap">{translations.warningSeconds}</label>
                        <input type="number" value={activeTimer.warningSeconds} onChange={(e) => handleTimeSettingChange(activeTimerId, 'warning', parseInt(e.target.value))} min="5" max="300" className="w-20 p-2 text-center border-2 border-[#5B4A9E] rounded-md"/>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => handleTimerControl(activeTimerId, activeTimer.isRunning ? 'pause' : 'start')} className="w-32 px-6 py-3 bg-gradient-to-r from-[#5B4A9E] to-[#4A9E9E] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        {activeTimer.isRunning ? translations.pause : translations.start}
                    </button>
                    <button onClick={() => handleTimerControl(activeTimerId, 'reset')} className="w-32 px-6 py-3 bg-gradient-to-r from-[#5B4A9E] to-[#4A9E9E] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        {translations.reset}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                 <button onClick={exportToCSV} className="px-6 py-3 bg-[#6080A3] hover:bg-[#4d6782] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    {translations.export}
                </button>
                <button onClick={handleFinishDebate} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    {translations.finishDebate}
                </button>
            </div>
        </main>
      ) : (
         <SummaryScreen
            timerLogs={timerLogs}
            teamNames={teamNames}
            translations={translations}
            onExport={exportToCSV}
            onReset={handleResetApp}
        />
      )}
    </div>
  );
};

export default App;