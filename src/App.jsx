import React, { useRef, useState, useEffect } from "react";

const ACTIONS = [
	{ name: "熬夜", effects: { hp: -50, stamina: -50 } },
	{ name: "按时起床", effects: { strength: 1 } },
	{ name: "玩手机", effects: { hp: -5, stamina: -5 } },
	{ name: "冥想", effects: { intelligence: 1, hp: 5, stamina: 5 } },
	{ name: "运动", effects: { strength: 1, stamina: -1 } },
	{ name: "日常训练", effects: { strength: 5 } },
	{ name: "练字", effects: { intelligence: 1, hp: 2, stamina: 2 } },
	{ name: "打扫卫生", effects: { hp: 2, stamina: 2 } },
	{ name: "复习", effects: { intelligence: 1 } },
	{ name: "看一页书", effects: { intelligence: 1 } },
	{ name: "练金刚功", effects: { strength: 3 } },
	{ name: "背诵(段)", effects: { intelligence: 1 } },
	{ name: "背整篇", effects: { intelligence: 5 } },
	{ name: "复述(段)", effects: { intelligence: 1 } },
	{ name: "听力(段)", effects: { intelligence: 1 } }
];

const LOCAL_STORAGE_KEY = "attribute_tracker_data";

export default function AttributeTracker() {
	const isFirstLoad = useRef(true);
	const [attributes, setAttributes] = useState({
		hp: 100,
		stamina: 100,
		strength: 0,
		intelligence: 0
	});
	const [logs, setLogs] = useState([]);

	useEffect(() => {
		const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setAttributes(parsed.attributes);
				setLogs(parsed.logs);
			} catch (e) {
				console.error("Error parsing saved data:", e);
			}
		}
	}, []);

	useEffect(() => {
		if (isFirstLoad.current) {
			isFirstLoad.current = false; // 跳过第一次（即加载缓存后）保存
			return;
		}
		window.localStorage.setItem(
			LOCAL_STORAGE_KEY,
			JSON.stringify({ attributes, logs })
		);
	}, [attributes, logs]);

	const applyAction = (action) => {
		const newAttrs = { ...attributes };
		const effects = action.effects;

		for (let key in effects) {
			newAttrs[key] = Math.max(0, (newAttrs[key] || 0) + effects[key]);
		}

		setAttributes(newAttrs);
		setLogs([
			{
				action: action.name,
				time: new Date().toLocaleTimeString(),
				effects: action.effects
			},
			...logs
		]);
	};

	const clearData = () => {
		window.localStorage.removeItem(LOCAL_STORAGE_KEY);
		setAttributes({ hp: 100, stamina: 100, strength: 0, intelligence: 0 });
		setLogs([]);
	};

	const renderAttributeBar = (label, value, max = 100) => (
		<div className="flex items-center space-x-3">
			<div className="w-16 text-right font-medium">{label}</div>
			<div className="flex-1">
				<div className="w-full bg-gray-200 rounded h-2">
					<div
						className="bg-blue-500 h-2 rounded"
						style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
					></div>
				</div>
			</div>
			<div className="w-10 text-sm text-right">{value}</div>
		</div>
	);

	return (
		<div className="p-4 max-w-4xl mx-auto space-y-8">
			<div className="sticky top-0 bg-white shadow z-10 p-4 rounded-xl space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">属性总览</h2>
					<button
						onClick={clearData}
						className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
					>
						清空缓存
					</button>
				</div>
				<div className="space-y-2">
					{renderAttributeBar("血量", attributes.hp)}
					{renderAttributeBar("耐力", attributes.stamina)}
					{renderAttributeBar("力量", attributes.strength, 100)}
					{renderAttributeBar("智力", attributes.intelligence, 100)}
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-xl font-semibold text-center">选择动作</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{ACTIONS.map((action, idx) => (
						<button
							key={idx}
							onClick={() => applyAction(action)}
							className="relative group bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded shadow text-sm"
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
					))}
				</div>
			</div>

			<div className="mt-6">
				<h3 className="text-xl font-semibold mb-2 text-center">动作记录</h3>
				<ul className="space-y-1 text-left max-h-64 overflow-y-auto px-2 border rounded">
					{logs.map((log, idx) => (
						<li key={idx} className="text-sm border-b py-1">
							[{log.time}] {log.action}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
