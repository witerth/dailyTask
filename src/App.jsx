import React, { useState, useEffect, useRef } from "react";

const ACTIONS = [
	{ name: "熬夜", effects: { hp: -50, stamina: -50 }, negative: true },
	{ name: "玩手机", effects: { hp: -5, stamina: -5 }, negative: true },
	{ name: "冥想", effects: { intelligence: 1, hp: 5, stamina: 5 } },
	{ name: "运动", effects: { strength: 1, stamina: -1 } },
	{ name: "练字", effects: { intelligence: 1, hp: 2, stamina: 2 } },
	{ name: "打扫卫生", effects: { hp: 2, stamina: 2 } },
	{ name: "读书", effects: { intelligence: 1 } }
];

const DAILY_TASKS = [
	"7点半起床",
	"晨练",
	"查看每日任务内容",
	"背诵文章",
	"听力训练",
	"复述训练",
	"锻炼半小时",
	"看5页书",
	"10点半睡觉"
];

const LOCAL_STORAGE_KEY = "attribute_tracker_data";

export default function AttributeTracker() {
	const [attributes, setAttributes] = useState({
		hp: 100,
		stamina: 100,
		strength: 0,
		intelligence: 0
	});
	const [logs, setLogs] = useState([]);
	const [dailyTasksCompleted, setDailyTasksCompleted] = useState([]);
	const isFirstLoad = useRef(true);

	useEffect(() => {
		const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setAttributes(
					parsed.attributes || {
						hp: 100,
						stamina: 100,
						strength: 0,
						intelligence: 0
					}
				);
				setLogs(parsed.logs || []);
				setDailyTasksCompleted(parsed.dailyTasksCompleted || []);
			} catch (e) {
				console.error("Error parsing saved data:", e);
			}
		}
	}, []);

	useEffect(() => {
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		localStorage.setItem(
			LOCAL_STORAGE_KEY,
			JSON.stringify({ attributes, logs, dailyTasksCompleted })
		);
	}, [attributes, logs, dailyTasksCompleted]);

	const applyAction = (action) => {
		const newAttrs = { ...attributes };
		for (let key in action.effects) {
			newAttrs[key] = Math.max(0, (newAttrs[key] || 0) + action.effects[key]);
		}
		setAttributes(newAttrs);
		setLogs([
			{
				type: "action",
				action: action.name,
				time: new Date().toLocaleTimeString(),
				effects: action.effects
			},
			...logs
		]);
	};

	const clearData = () => {
		if (window.confirm("确定要清空所有数据吗？此操作无法撤销。")) {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			setAttributes({ hp: 100, stamina: 100, strength: 0, intelligence: 0 });
			setLogs([]);
			setDailyTasksCompleted([]);
		}
	};

	const toggleTask = (task) => {
		if (dailyTasksCompleted.includes(task)) {
			setDailyTasksCompleted(dailyTasksCompleted.filter((t) => t !== task));
			setLogs(
				logs.filter((log) => !(log.type === "task" && log.task === task))
			);
		} else {
			setDailyTasksCompleted([...dailyTasksCompleted, task]);
			setLogs([
				{
					type: "task",
					task,
					time: new Date().toLocaleTimeString(),
					effects: {}
				},
				...logs
			]);
		}
	};

	const deleteLog = (index) => {
		const log = logs[index];
		if (!log) return;
		if (log.type === "action") {
			const reverted = { ...attributes };
			for (let key in log.effects) {
				reverted[key] = Math.max(0, reverted[key] - log.effects[key]);
			}
			setAttributes(reverted);
		} else if (log.type === "task") {
			setDailyTasksCompleted(dailyTasksCompleted.filter((t) => t !== log.task));
		}
		setLogs(logs.filter((_, i) => i !== index));
	};

	const getColor = (label) => {
		switch (label) {
			case "血量":
				return "bg-red-500";
			case "耐力":
				return "bg-orange-400";
			case "力量":
				return "bg-green-500";
			case "智力":
				return "bg-blue-500";
			default:
				return "bg-gray-500";
		}
	};

	const renderAttributeBar = (label, value, max = 100) => (
		<div className="flex items-center space-x-3">
			<div className="w-16 text-right font-medium text-sm sm:text-base">
				{label}
			</div>
			<div className="flex-1">
				<div className="w-full bg-gray-200 rounded h-2 sm:h-3">
					<div
						className={`${getColor(label)} h-2 sm:h-3 rounded`}
						style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
					></div>
				</div>
			</div>
			<div className="w-10 text-xs sm:text-sm text-right">{value}</div>
		</div>
	);

	const completedCount = dailyTasksCompleted.length;
	const totalTasks = DAILY_TASKS.length;
	const cardStyle = "bg-white border border-gray-300 rounded-lg shadow-lg p-4";

	// 判断“熬夜”是否已执行过
	const hasStayedUp = logs.some(
		(log) => log.type === "action" && log.action === "熬夜"
	);

	// 判断某个动作是否能执行（会减少但属性为0）
	const canApplyAction = (action) => {
		return Object.entries(action.effects).every(([key, val]) => {
			if (val < 0) return attributes[key] > 0;
			return true;
		});
	};

	return (
		<div className="p-4 max-w-7xl mx-auto space-y-6 sm:space-y-8">
			{/* 属性总览 */}
			<div className={`${cardStyle} sticky top-0 z-20`}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl sm:text-2xl font-bold">属性总览</h2>
					<button
						onClick={clearData}
						className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
					>
						清空缓存
					</button>
				</div>
				<div className="space-y-2">
					{renderAttributeBar("血量", attributes.hp)}
					{renderAttributeBar("耐力", attributes.stamina)}
					{renderAttributeBar("力量", attributes.strength)}
					{renderAttributeBar("智力", attributes.intelligence)}
				</div>
			</div>

			{/* 主体区域 */}
			<div className="flex flex-col md:grid md:grid-cols-3 gap-6">
				{/* 每日任务 */}
				<div className={`${cardStyle} h-fit`}>
					<h3 className="text-lg sm:text-xl font-semibold text-center mb-3">
						每日任务
					</h3>
					<div className="mb-4 text-center font-medium text-gray-700 text-sm sm:text-base">
						完成任务：{completedCount} / {totalTasks}
					</div>
					<ul className="space-y-2 text-xs sm:text-sm">
						{DAILY_TASKS.map((task, idx) => {
							const done = dailyTasksCompleted.includes(task);
							return (
								<li
									key={idx}
									onClick={() => toggleTask(task)}
									className={`cursor-pointer flex items-center gap-2 px-3 py-2 border rounded select-none ${
										done
											? "bg-green-100 text-green-700 line-through"
											: "hover:bg-gray-100"
									}`}
								>
									<input
										type="checkbox"
										readOnly
										checked={done}
										className="form-checkbox h-4 w-4 sm:h-5 sm:w-5"
									/>
									<span className="flex-1">{task}</span>
								</li>
							);
						})}
					</ul>
				</div>

				{/* 动作 + 日志 */}
				<div className="md:col-span-2 flex flex-col gap-4">
					<div className={cardStyle}>
						<h3 className="text-lg sm:text-xl font-semibold text-center mb-3">
							选择动作
						</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-2 sm:px-0">
							{ACTIONS.map((action, idx) => {
								const isDisabled =
									(action.name === "熬夜" && hasStayedUp) ||
									!canApplyAction(action);
								return (
									<button
										key={idx}
										onClick={() => applyAction(action)}
										disabled={isDisabled}
										className={`relative group text-white py-2 px-3 rounded shadow text-xs sm:text-sm transition-colors ${
											action.negative
												? "bg-red-500 hover:bg-red-600"
												: "bg-blue-500 hover:bg-blue-600"
										} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{action.name}
										<div className="absolute z-20 hidden group-hover:block bg-white text-black text-xs border rounded p-2 left-0 top-full mt-1 w-48 shadow-xl">
											{Object.entries(action.effects).map(([attr, val]) => (
												<div key={attr}>
													{attr}：{val >= 0 ? "+" : ""}
													{val}
												</div>
											))}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					<div className={`${cardStyle} flex flex-col max-h-[800px]`}>
						<h3 className="text-lg sm:text-xl font-semibold mb-2 text-center flex-shrink-0">
							操作日志
						</h3>
						<ul
							className="overflow-y-scroll flex-grow space-y-1 text-left border-t border-gray-300 pt-2"
							style={{ scrollbarGutter: "stable" }}
						>
							{logs.map((log, idx) => (
								<li
									key={idx}
									className="text-xs sm:text-sm border-b py-1 flex justify-between items-center"
								>
									<span>
										<span className="text-gray-400 text-xs mr-1">
											[{log.time}]
										</span>
										{log.type === "action" ? log.action : log.task}
										{log.type === "action" && (
											<span className="ml-2 text-gray-500 text-xs">
												{Object.entries(log.effects)
													.map(([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`)
													.join(", ")}
											</span>
										)}
									</span>
									<button
										onClick={() => deleteLog(idx)}
										className="text-red-500 text-xs hover:underline"
									>
										删除
									</button>
								</li>
							))}
							{logs.length === 0 && (
								<li className="text-center text-gray-400 py-10">
									暂无操作记录
								</li>
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
