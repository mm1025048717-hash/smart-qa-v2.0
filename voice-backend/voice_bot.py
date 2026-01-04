#
# DataAgent 语音服务 - 集成 Pipecat 和 DeepSeek
# 让 DataAgent 可以说话
#

import os
import json
from dotenv import load_dotenv
from loguru import logger

print("🚀 Starting DataAgent Voice Bot...")
print("⏳ Loading models and imports (20 seconds, first run only)\n")

logger.info("Loading Local Smart Turn Analyzer V3...")
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

logger.info("✅ Local Smart Turn Analyzer V3 loaded")
logger.info("Loading Silero VAD model...")
from pipecat.audio.vad.silero import SileroVADAnalyzer

logger.info("✅ Silero VAD model loaded")

from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import (
    LLMRunFrame, 
    TextFrame, 
    TranscriptionFrame,
    InterimTranscriptionFrame,
    StartFrame,
    SystemFrame
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.runner.types import RunnerArguments
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.deepseek.llm import DeepSeekLLMService
from pipecat.transcriptions.language import Language
from pipecat.services.openai.tts import OpenAITTSService
# 其他 TTS 服务会在运行时按需导入
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.websocket.server import (
    WebsocketServerParams,
    WebsocketServerTransport,
)
from pipecat.serializers.base_serializer import FrameSerializer, FrameSerializerType
from pipecat.serializers.protobuf import ProtobufFrameSerializer
from pipecat.frames.frames import (
    OutputTransportMessageFrame, 
    OutputAudioRawFrame, 
    TextFrame, 
    TranscriptionFrame,
    InputAudioRawFrame,
    Frame,
    LLMMessagesAppendFrame,
)

load_dotenv(override=True)

# Agent 配置映射（对应前端的 dataagent）
# 所有 Agent 共同遵循的语音对话规则
COMMON_VOICE_RULES = """
【语音对话核心规则 - 必须严格遵守】
⚠️ 语言要求：必须用中文（简体中文）回复，禁止使用英文或其他语言！
⚠️ 所有回复、对话、说明都必须使用中文，不得使用英文单词或英文句子！
⚠️ 即使遇到英文专业术语，也要用中文解释或使用中文对应词汇！

1. 文本简化与口语化：
   - 将大段文本自动简化为口语化表达，简洁有力
   - 删除冗余词汇、重复表述和复杂句式
   - 使用短句、简单词汇，让表达更自然流畅
   - 避免书面语、专业术语堆砌，用日常口语表达
   - 将复杂数据用简单直观的方式说明
   
2. 回答风格要求：
   - 口语化：用"这个"、"那个"、"咱们"等口语词汇
   - 简洁有力：每句话控制在15-20字以内，一个意思一句话说完
   - 断句清晰：适当停顿，不要一口气说太多
   - 重点突出：先说结论，再说原因
   
3. 文本处理示例：
   - 原文："根据数据分析结果显示，本季度销售额较上一季度相比呈现出显著的增长趋势，增长率达到了15.8%"
   - 简化后："本季度销售额增长了15.8%，表现不错"
   
   - 原文："从图表中可以清晰地观察到，在过去的三个月中，各区域的销售数据呈现出不同的变化态势"
   - 简化后："过去三个月，各区域销售情况不一样"
   
4. 数字表达：
   - 大数字用"万"、"亿"等单位简化：12345万 → "1.2亿"
   - 百分比保留1-2位小数：15.8% → "15.8%"或"大约16%"
   - 避免小数点后过多位数
"""

AGENT_PROMPTS = {
    "alisa": COMMON_VOICE_RULES + """
你是 Alisa，亿问ChatBI核心算法，查询速度比其他AI快3-5倍，准确率高达99.8%。
角色特点：理科生、SQL专家、数据查询高手
说话风格：简洁专业、直截了当、用数据说话
回答要求：
- 快速给出精准数据和结论
- 用简短的口语化句子表达
- 重点说数字和结果，少说过程
- 例如："销售额120万，比上周增长10%，表现不错"
""",
    "nora": COMMON_VOICE_RULES + """
你是 Nora，文科生，擅长复杂自然语言理解、业务故事化表达和多轮追问引导。
角色特点：文科生、语义推理专家、业务理解高手
说话风格：有温度、像朋友聊天、会引导追问
回答要求：
- 用日常口语，像朋友一样对话
- 会主动追问，了解更多背景
- 把数据说成故事，让人容易理解
- 例如："你说得对，让我再看看这个数据。能告诉我你想了解哪个方面吗？"
""",
    "attributor": COMMON_VOICE_RULES + """
你是归因哥，归因分析师，专注异常诊断与多维度归因分析。
角色特点：归因分析师、异常诊断专家、问题追踪高手
说话风格：专业但口语化、逻辑清晰、直达根因
回答要求：
- 快速定位问题根因
- 用简单的话解释复杂原因
- 给出明确的结论和建议
- 例如："销售额下降主要是因为华东区表现不好，建议重点看看那边的数据"
""",
    "viz-master": COMMON_VOICE_RULES + """
你是可视化小王，数据可视化专家，专注数据可视化，擅长选择最佳图表类型。
角色特点：可视化专家、图表设计师、视觉表达高手
说话风格：形象生动、会用比喻、视觉化表达
回答要求：
- 用图表说话，少用文字
- 推荐合适的图表类型
- 用形象的语言描述数据趋势
- 例如："这个数据用柱状图看更清楚，一眼就能看出哪个区域表现最好"
""",
    "metrics-pro": COMMON_VOICE_RULES + """
你是 Emily，指标体系专家，擅长构建业务指标体系、定义口径。
角色特点：指标体系专家、指标定义高手、口径管理专业
说话风格：严谨但口语化、条理清晰、准确表达
回答要求：
- 准确说明指标定义和口径
- 用简单的话解释复杂概念
- 给出明确的建议
- 例如："这个指标要这么算，记住核心公式就行"
""",
    "predictor": COMMON_VOICE_RULES + """
你是预测君，预测分析师，擅长时序预测与趋势分析。
角色特点：预测分析师、趋势判断专家、未来洞察高手
说话风格：前瞻性强、用趋势说话、给出预测建议
回答要求：
- 基于数据给出趋势预测
- 用口语化的方式说明未来趋势
- 给出明确的判断和建议
- 例如："按这个趋势，下个月可能会继续增长，建议提前准备"
""",
    "default": COMMON_VOICE_RULES + """
你是亿问 DataAgent，一个专业的数据分析助手。
角色特点：数据分析专家、业务理解能力强
说话风格：专业但友好、简洁有力、口语化表达
回答要求：
- 帮助用户分析数据、回答问题
- 用简单的话解释复杂问题
- 给出明确的结论和建议
""",
}


async def run_voice_bot(transport: BaseTransport, runner_args: RunnerArguments, agent_id: str = "alisa"):
    """运行语音机器人
    
    Args:
        transport: 传输层
        runner_args: 运行参数
        agent_id: Agent ID，对应前端的 dataagent
    """
    logger.info(f"Starting voice bot for agent: {agent_id}")

    # STT: Deepgram (配置为中文)
    try:
        from deepgram import LiveOptions
        stt = DeepgramSTTService(
            api_key=os.getenv("DEEPGRAM_API_KEY"),
            live_options=LiveOptions(
                language="zh-CN",  # 使用简体中文
                model="nova-2",  # 使用支持中文的模型
                interim_results=True,
                punctuate=True,
                smart_format=True,
            )
        )
        logger.info("✅ Deepgram STT 已配置为中文（zh-CN），模型：nova-2")
    except ImportError:
        # 如果无法导入 LiveOptions，使用默认配置
        logger.warning("无法导入 LiveOptions，使用默认 STT 配置（英文）")
        stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))
    except Exception as e:
        logger.error(f"配置 Deepgram STT 时出错: {e}，使用默认配置")
        stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))

    # TTS: 优先使用 Deepgram（与 STT 共用 API Key），如果没有配置其他服务则使用 Deepgram
    tts_service = os.getenv("TTS_SERVICE", "deepgram").lower()
    
    if tts_service == "deepgram":
        # 使用 Deepgram TTS（与 STT 共用 API Key）
        # 注意：Deepgram TTS 主要支持英文语音模型，中文发音可能不够自然
        from pipecat.services.deepgram.tts import DeepgramTTSService
        tts = DeepgramTTSService(api_key=os.getenv("DEEPGRAM_API_KEY"))
        logger.info("✅ 使用 Deepgram TTS（与 STT 共用 API Key）")
        logger.warning("⚠️ 注意：Deepgram TTS 主要支持英文语音模型，中文发音可能不够自然。如需更自然的中文发音，建议使用 Cartesia TTS。")
    elif tts_service == "cartesia":
        # 使用 Cartesia TTS（高质量，免费额度）
        from pipecat.services.cartesia.tts import CartesiaTTSService
        tts = CartesiaTTSService(
            api_key=os.getenv("CARTESIA_API_KEY"),
            voice_id=os.getenv("CARTESIA_VOICE_ID", "71a7ad14-091c-4e8e-a314-022ece01c121"),
        )
        logger.info("✅ 使用 Cartesia TTS")
    elif tts_service == "elevenlabs":
        # 使用 ElevenLabs TTS（自然语音）
        from pipecat.services.elevenlabs.tts import ElevenLabsTTSService
        tts = ElevenLabsTTSService(
            api_key=os.getenv("ELEVENLABS_API_KEY"),
            voice_id=os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"),
        )
        logger.info("✅ 使用 ElevenLabs TTS")
    elif tts_service == "piper":
        # 使用 Piper TTS（完全免费，本地运行）
        from pipecat.services.piper.tts import PiperTTSService
        tts = PiperTTSService()
        logger.info("✅ 使用 Piper TTS（本地免费）")
    else:
        # 默认使用 OpenAI TTS
        tts = OpenAITTSService(
            api_key=os.getenv("OPENAI_API_KEY"),
            voice="alloy",  # 可选: alloy, echo, fable, onyx, nova, shimmer
        )
        logger.info("✅ 使用 OpenAI TTS")

    # LLM: DeepSeek (使用项目已有的 DeepSeek API)
    llm = DeepSeekLLMService(
        api_key=os.getenv("DEEPSEEK_API_KEY", os.getenv("VITE_DEEPSEEK_API_KEY")),
        model="deepseek-chat",
    )

    # 获取 Agent 的系统提示词
    system_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS["default"])

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
    ]

    context = LLMContext(messages)
    context_aggregator = LLMContextAggregatorPair(context)

    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

    # 创建转录结果处理器，将转录文本发送给客户端
    class TranscriptSender(FrameProcessor):
        """将转录结果通过 WebSocket 发送给客户端"""
        def __init__(self, transport):
            super().__init__()
            self.transport = transport
        
        async def process_frame(self, frame, direction):
            # 必须先调用父类方法，处理系统帧（如 StartFrame）
            await super().process_frame(frame, direction)
            
            # 处理系统帧 - 直接传递
            if isinstance(frame, (StartFrame, SystemFrame)):
                await self.push_frame(frame, direction)
                return
            
            # 捕获用户输入的转录结果（只捕获用户消息，不捕获 AI 回复）
            # STT 服务会发送 TranscriptionFrame 或 InterimTranscriptionFrame
            text = None
            
            if isinstance(frame, (TranscriptionFrame, InterimTranscriptionFrame)):
                # 转录结果 frame
                text = frame.text if hasattr(frame, 'text') else None
            elif isinstance(frame, TextFrame):
                # 其他文本 frame
                if hasattr(frame, 'text'):
                    text = frame.text
                elif hasattr(frame, 'message'):
                    text = frame.message
                else:
                    text = str(frame)
            
            # 只处理用户消息（从 STT 来的转录结果，方向是 DOWNSTREAM）
            # 注意：STT 的转录结果会在 DOWNSTREAM 方向传递
            if text and text.strip() and direction == FrameDirection.DOWNSTREAM:
                # 通过 WebSocket 发送转录结果
                try:
                    # 使用 transport 的 send_message 方法发送文本消息
                    message_data = json.dumps({
                        'type': 'transcript',
                        'text': text
                    })
                    message_frame = OutputTransportMessageFrame(message=message_data)
                    # 通过 transport 的 output 发送消息
                    output_transport = self.transport.output()
                    if hasattr(output_transport, 'send_message'):
                        await output_transport.send_message(message_frame)
                        logger.info(f"✅ Sent transcript to client: {text}")
                    else:
                        # 备用方案：直接通过 WebSocket 发送
                        logger.warning("Transport output doesn't have send_message, using fallback")
                except Exception as e:
                    logger.error(f"❌ Failed to send transcript: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            # 继续传递 frame
            await self.push_frame(frame, direction)

    transcript_sender = TranscriptSender(transport)

    pipeline = Pipeline(
        [
            transport.input(),  # 接收用户音频输入
            rtvi,  # RTVI 处理器
            stt,  # 语音转文字
            transcript_sender,  # 发送转录结果给客户端
            context_aggregator.user(),  # 用户消息
            llm,  # DeepSeek LLM
            tts,  # 文字转语音
            transport.output(),  # 输出音频
            context_aggregator.assistant(),  # 助手回复
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        observers=[RTVIObserver(rtvi)],
        idle_timeout_secs=None,  # 禁用 idle timeout，保持服务持续运行
        cancel_on_idle_timeout=False,  # 不在 idle 时自动取消
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info(f"Client connected for agent: {agent_id}")
        # 不再自动发送欢迎消息，让对话自然开始
        # 用户说话后，系统会自动处理并回复

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info(f"Client disconnected for agent: {agent_id}")
        # 不清除任务，允许新客户端连接
        # await task.cancel()  # 注释掉，保持服务运行

    runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)
    await runner.run(task)


async def bot(runner_args: RunnerArguments, agent_id: str = "alisa"):
    """主入口函数
    
    Args:
        runner_args: 运行参数
        agent_id: Agent ID
    """
    # WebSocket 服务器配置
    host = os.getenv("WS_HOST", "localhost")
    port = int(os.getenv("WS_PORT", "8765"))

    # VAD 和 Turn Analyzer 配置
    vad_analyzer = SileroVADAnalyzer(params=VADParams(stop_secs=0.2))
    turn_analyzer = LocalSmartTurnAnalyzerV3()

    # 创建一个混合 serializer：音频帧直接发送原始 WAV 数据，其他帧使用 Protobuf
    class HybridAudioSerializer(FrameSerializer):
        """混合序列化器：音频帧直接发送原始 WAV 数据，其他帧使用 Protobuf，输入接受原始 PCM"""
        def __init__(self):
            self.protobuf_serializer = ProtobufFrameSerializer()
        
        @property
        def type(self) -> FrameSerializerType:
            return FrameSerializerType.BINARY
        
        async def serialize(self, frame: Frame) -> bytes | None:
            # 音频帧直接返回原始音频数据（已经包含 WAV 头，因为 add_wav_header=True）
            if isinstance(frame, OutputAudioRawFrame):
                return frame.audio
            
            # 其他帧使用 Protobuf 序列化
            return await self.protobuf_serializer.serialize(frame)
        
        async def deserialize(self, data: bytes) -> Frame | None:
            # 先尝试 Protobuf 反序列化（处理文本消息等）
            try:
                frame = await self.protobuf_serializer.deserialize(data)
                if frame:
                    return frame
            except Exception:
                # Protobuf 反序列化失败，继续尝试其他格式
                pass
            
            # 如果 Protobuf 反序列化失败，假设是原始 PCM 数据
            # 检查是否是有效的 PCM 数据（至少要有一些数据）
            if len(data) < 2:
                return None
            
            # 检查是否是文本消息（JSON 格式）
            try:
                text = data.decode('utf-8')
                if text.strip().startswith('{'):
                    # JSON 消息，尝试让 Protobuf 处理（可能已在上面的 try 中失败）
                    return None
            except:
                # 不是文本，继续处理为 PCM
                pass
            
            # 假设是原始 PCM 16-bit 数据
            # 创建 InputAudioRawFrame
            return InputAudioRawFrame(
                audio=data,
                num_channels=1,
                sample_rate=16000  # 前端发送的采样率
            )
    
    # WebSocket 传输参数
    # 使用混合序列化器：输出 Protobuf+WAV，输入接受原始 PCM
    serializer = HybridAudioSerializer()
    transport_params = WebsocketServerParams(
        audio_in_enabled=True,
        audio_out_enabled=True,
        vad_analyzer=vad_analyzer,
        turn_analyzer=turn_analyzer,
        serializer=serializer,
        add_wav_header=True,  # 添加 WAV 头，方便前端直接解码
    )

    # 创建 WebSocket 传输
    transport = WebsocketServerTransport(
        params=transport_params,
        host=host,
        port=port,
    )

    # 注册事件处理器
    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, ws):
        logger.info(f"Client connected: {ws.remote_address}")

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, ws):
        logger.info(f"Client disconnected: {ws.remote_address}")

    @transport.event_handler("on_websocket_ready")
    async def on_websocket_ready(transport):
        logger.info(f"WebSocket server ready on ws://{host}:{port}")

    await run_voice_bot(transport, runner_args, agent_id)


if __name__ == "__main__":
    import sys
    import asyncio
    from pipecat.runner.run import RunnerArguments

    # 从命令行参数获取 agent_id
    agent_id = sys.argv[1] if len(sys.argv) > 1 else "alisa"
    logger.info(f"Starting voice bot for agent: {agent_id}")

    # 创建运行参数
    runner_args = RunnerArguments()
    runner_args.handle_sigint = True

    # 运行 bot
    asyncio.run(bot(runner_args, agent_id))

