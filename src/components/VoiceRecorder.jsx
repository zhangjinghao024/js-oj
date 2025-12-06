import React, { useState, useRef } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscriptReceived }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // 开始录音
    const startRecording = async () => {
        try {
            console.log('🎤 请求麦克风权限...');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            console.log('✅ 麦克风权限已获取');

            // 重置 chunks
            chunksRef.current = [];

            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                console.log('⏹ 录音停止，共', chunksRef.current.length, '个音频块');

                // 停止麦克风
                stream.getTracks().forEach(track => track.stop());

                // 处理录音
                await processRecording(chunksRef.current);
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            console.log('🎤 开始录音...');

        } catch (error) {
            console.error('❌ 录音失败:', error);
            alert('无法访问麦克风: ' + error.message);
        }
    };

    // 停止录音
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log('🛑 停止录音');
        }
    };

    // 处理录音
    const processRecording = async (chunks) => {
        try {
            setIsProcessing(true);

            const blob = new Blob(chunks, { type: 'audio/webm' });
            console.log('📦 音频 Blob:', blob.size, '字节');

            // 转换为 base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Audio = reader.result;
                    console.log('📤 发送到后端...');

                    // ⭐ 调用回调并等待完成
                    await onTranscriptReceived(base64Audio);

                    console.log('✅ 识别完成');
                } catch (error) {
                    console.error('❌ 识别失败:', error);
                    alert('识别失败: ' + error.message);
                } finally {
                    // ⭐ 无论成功失败都重置状态
                    setIsProcessing(false);
                }
            };

            reader.onerror = () => {
                console.error('❌ 读取音频失败');
                alert('读取音频失败');
                setIsProcessing(false);
            };

            reader.readAsDataURL(blob);

        } catch (error) {
            console.error('❌ 处理失败:', error);
            alert('处理录音失败: ' + error.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="voice-recorder">
            {!isRecording && !isProcessing && (
                <button
                    className="btn btn-voice"
                    onClick={startRecording}
                >
                    🎤 语音输入
                </button>
            )}

            {isRecording && (
                <button
                    className="btn btn-voice recording"
                    onClick={stopRecording}
                >
                    <span className="recording-icon">⏺</span> 录音中...
                </button>
            )}

            {isProcessing && (
                <button
                    className="btn btn-voice processing"
                    disabled
                >
                    🔄 识别中...
                </button>
            )}
        </div>
    );
};

export default VoiceRecorder;