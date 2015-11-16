package com.faceplusplus.hetaolivenessdetection.util;

import java.io.File;
import java.io.IOException;

import com.faceplusplus.hetaolivenessdetection.MainActivity;

import android.app.Activity;
import android.hardware.Camera;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.Environment;
import android.util.Log;

public class MediaRecorderUtil {

	private MediaRecorder mMediaRecorder;
	private Camera mCamera;
	private Camera.PreviewCallback mCallback;
	private String videoPath = Environment.getExternalStorageDirectory()
			.getAbsolutePath() + "/facepp_video";
	private int width, height;

	public MediaRecorderUtil(Camera.PreviewCallback mCallback, Camera mCamera,
			String session) {
		this.mCamera = mCamera;
		width = mCamera.getParameters().getPreviewSize().width;
		height = mCamera.getParameters().getPreviewSize().height;

		this.mCallback = mCallback;
		if (Util.isDebug) {
			videoPath = Constant.dirName + "/" + session;
		}

		mMediaRecorder = new MediaRecorder();
	}

	public void start() {
		mMediaRecorder.start();
		mCamera.setPreviewCallback(mCallback);
	}

	public boolean prepareVideoRecorder() {
		// Step 1: Unlock and set camera to MediaRecorder
		mCamera.unlock();// 解锁Camera对象
		mMediaRecorder.reset();
		mMediaRecorder.setCamera(mCamera);

		mMediaRecorder.setOrientationHint(270);
		// Step 2: Set sources
		mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
		mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
		mMediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
		mMediaRecorder.setVideoSize(width, height);
		mMediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);
		mMediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
		// mMediaRecorder.setVideoFrameRate(5);
		// mMediaRecorder.setCaptureRate(5);
		// mMediaRecorder.setVideoSize(320, 240);
		// Step 4: Set output file
		File dir = new File(videoPath);
		if (!dir.exists())
			dir.mkdirs();
		mMediaRecorder.setOutputFile(new File(dir, ""
				+ System.currentTimeMillis() + ".mp4").getAbsolutePath()); 

		// Step 5: Prepare configured MediaRecorder
		try {
			mCamera.setPreviewCallback(mCallback);
			mMediaRecorder.prepare();
		} catch (IllegalStateException e) {
			e.printStackTrace();
			releaseMediaRecorder();
			return false;
		} catch (IOException e) {
			e.printStackTrace();
			releaseMediaRecorder();
			return false;
		} 
		return true;
	}

	// public boolean prepareVideoRecorder() {
	// // Step 1: Unlock and set camera to MediaRecorder
	// mCamera.unlock();
	// mMediaRecorder.setCamera(mCamera);
	//
	// mMediaRecorder.setOrientationHint(270);
	// // Step 2: Set sources
	// mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
	// mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
	// CamcorderProfile camcorderProfile = CamcorderProfile
	// .get(CamcorderProfile.QUALITY_LOW);
	// // Camera.Size previewSize = mCamera.getParameters().getPreviewSize();
	// camcorderProfile.videoFrameWidth = 640;
	// camcorderProfile.videoFrameHeight = 480;
	// // camcorderProfile.videoCodec = MediaRecorder.VideoEncoder.MPEG_4_SP;
	// // Step 3: Set a CamcorderProfile (requires API Level 8 or higher)
	// mMediaRecorder.setProfile(camcorderProfile);
	// mMediaRecorder.setVideoFrameRate(5);
	// mMediaRecorder.setCaptureRate(5);
	// // mMediaRecorder.setVideoSize(320, 240);
	// // Step 4: Set output file
	// File dir = new File(Environment.getExternalStorageDirectory(),
	// "facepp_video");
	// if (!dir.exists())
	// dir.mkdirs();
	// mMediaRecorder.setOutputFile(new File(dir, ""
	// + System.currentTimeMillis() + ".mp4").getAbsolutePath());
	//
	// // Step 5: Prepare configured MediaRecorder
	// try {
	// mMediaRecorder.prepare();
	// } catch (IllegalStateException e) {
	// releaseMediaRecorder();
	// return false;
	// } catch (IOException e) {
	// releaseMediaRecorder();
	// return false;
	// }
	// return true;
	// }

	public void releaseMediaRecorder() {
		if (mMediaRecorder != null) {
			Log.w("ceshi", "mMediaRecorder.reset(");
			// clear recorder configuration
			mMediaRecorder.stop();
			mMediaRecorder.reset();
			// release the recorder object
			mMediaRecorder.release();
			mMediaRecorder = null;
			// Lock camera for later use i.e taking it back from MediaRecorder.
			// MediaRecorder doesn't need it anymore and we will release it if
			// the activity pauses.
			mCamera.lock();// 锁定Camera对象
			mCamera.setPreviewCallback(null);
			mCamera = null;
		}
	}

}
