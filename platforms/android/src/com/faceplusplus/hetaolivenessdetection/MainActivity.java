package com.faceplusplus.hetaolivenessdetection;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.hardware.Camera.CameraInfo;
import android.hardware.Camera.PreviewCallback;
import android.hardware.Camera.Size;
import android.os.Bundle;
import android.os.Handler;
import android.view.TextureView;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import com.faceplusplus.hetaolivenessdetection.util.ICamera;
import com.faceplusplus.hetaolivenessdetection.util.ConUtil;
import com.faceplusplus.hetaolivenessdetection.util.Constant;
import com.faceplusplus.hetaolivenessdetection.util.IDetection;
import com.faceplusplus.hetaolivenessdetection.util.DialogUtil;
import com.faceplusplus.hetaolivenessdetection.util.IFile;
import com.faceplusplus.hetaolivenessdetection.util.IMediaPlayer;
import com.faceplusplus.hetaolivenessdetection.util.MediaRecorderUtil;
import com.faceplusplus.hetaolivenessdetection.util.Screen;
import com.faceplusplus.hetaolivenessdetection.util.Util;
import com.mybofeng.sign.R;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.JsonHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.megvii.livenessdetection.DetectionConfig;
import com.megvii.livenessdetection.DetectionFrame;
import com.megvii.livenessdetection.Detector;
import com.megvii.livenessdetection.Detector.DetectionFailedType;
import com.megvii.livenessdetection.Detector.DetectionListener;
import com.megvii.livenessdetection.Detector.DetectionType;
import com.megvii.livenessdetection.bean.FaceInfo;
//import com.umeng.analytics.MobclickAgent;
import org.apache.http.Header;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.util.List;

public class MainActivity extends Activity implements PreviewCallback,
		DetectionListener, View.OnClickListener,
		TextureView.SurfaceTextureListener {

	private TextureView camerapreview;
	private FaceMask mFaceMask;// 画脸位置的类（调试时会用到）
	private ProgressBar mProgressBar;// 网络上传请求验证时出现的ProgressBar
	private TextView mTimeoutText;// 时间倒数textview
	private ImageView mCircleProgressbar;
	private ImageView headMask;
	private RelativeLayout circleMask;
	private LinearLayout headViewLinear;// "请在光线充足的情况下进行检测"这个视图
	private LinearLayout bottomViewLinear;// "请将正脸置于取景框内"这个视图
	private RelativeLayout rootView;// 根视图

	private AsyncHttpClient myAsyncHttpClient;
	private Detector mDetector;// 实体检测器
	private Handler mainHandler;
	private JSONObject jsonObject;
	private IMediaPlayer mIMediaPlayer;// 多媒体工具类
	private ICamera mICamera;// 照相机工具类
	private IFile mIFile;// 文件工具类
	private IDetection mIDetection;
	private DialogUtil mDialogUtil;
	private MediaRecorderUtil mediaRecorderUtil;// 录像

	private int startTimeout = 3;// 活体检测倒计时
	private String faceid, name;
	private long mTimeSendRequest = -1;
	private boolean isHandleStart;// 是否开始检测
	private Camera mCamera;
	private String mSession;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		init();
		initData();
	}

	private void init() {
		Screen.initialize(this);
		Util.APP_TYPE = Util.TYPE_REG;
		faceid = getIntent().getStringExtra(Constant.KEY_FACEID);
		name = getIntent().getStringExtra(Constant.KEY_NAME);
		mSession = ConUtil.getFormatterTime(System.currentTimeMillis());
		mainHandler = new Handler();
		myAsyncHttpClient = new AsyncHttpClient();
		mIMediaPlayer = new IMediaPlayer(this);
		mIFile = new IFile();
		mDialogUtil = new DialogUtil(this);
		rootView = (RelativeLayout) findViewById(R.id.activity_main_rootRel);
		mIDetection = new IDetection(this, rootView);
		mFaceMask = (FaceMask) findViewById(R.id.facemask);
		mICamera = new ICamera();
		camerapreview = (TextureView) findViewById(R.id.main_textureview);
		headMask = (ImageView) findViewById(R.id.main_head_mask);
		circleMask = (RelativeLayout) findViewById(R.id.main_circle_mask);
		circleMask.setVisibility(View.INVISIBLE);
		camerapreview.setSurfaceTextureListener(this);
		mProgressBar = (ProgressBar) findViewById(R.id.main_progressbar);
		mProgressBar.setVisibility(View.INVISIBLE);
		mCircleProgressbar = (ImageView) findViewById(R.id.main_circle_progress_bar);
		headViewLinear = (LinearLayout) findViewById(R.id.main_bottom_tips_head);
		headViewLinear.setVisibility(View.VISIBLE);
		bottomViewLinear = (LinearLayout) findViewById(R.id.main_tips_bottom);
		findViewById(R.id.main_bottom_start).setOnClickListener(this);
		mTimeoutText = (TextView) findViewById(R.id.main_time);

		mIDetection.viewsInit();
	}

	/**
	 * 初始化数据
	 */
	private void initData() {
		DetectionConfig config = new DetectionConfig.Builder().build();
		float pitchAngle = config.pitchAngle;
		float yawAngle = config.yawAngle;
		mDetector = new Detector(config);
		boolean initSuccess = mDetector.init(this, Util.readModel(this), "");
		if (!initSuccess) {
			mDialogUtil.showDialog("检测器初始化失败");
		}

		new Thread(new Runnable() {
			@Override
			public void run() {
				mIDetection.animationInit();
			}
		}).start();
	}

	@Override
	protected void onStart() {
		super.onStart();
	}

	@Override
	protected void onResume() {
		super.onResume();
		isHandleStart = false;
//		MobclickAgent.onResume(this);
		mCamera = mICamera.openCamera(this);
		if (mCamera != null) {
			CameraInfo cameraInfo = new CameraInfo();
			Camera.getCameraInfo(1, cameraInfo);
			mFaceMask
					.setFrontal(cameraInfo.facing == CameraInfo.CAMERA_FACING_FRONT);
			RelativeLayout.LayoutParams layout_params = mICamera
					.getLayoutParam();
			camerapreview.setLayoutParams(layout_params);
			mFaceMask.setLayoutParams(layout_params);
			mIDetection.mCurShowIndex = -1;
		} else {
			mDialogUtil.showDialog("打开前置摄像头失败");
		}
	}

	@Override
	public void onClick(View view) {
		switch (view.getId()) {
		case R.id.main_bottom_start:
			handleStart();
			break;
		}
	}

	/**
	 * 开始检测
	 */
	private void handleStart() {
		if (isHandleStart)
			return;
		isHandleStart = true;
		faceSuccessTime = 0;
		headMask.setVisibility(View.INVISIBLE);
		Animation animationIN = AnimationUtils.loadAnimation(MainActivity.this,
				R.anim.rightin);
		Animation animationOut = AnimationUtils.loadAnimation(
				MainActivity.this, R.anim.leftout);
		circleMask.setVisibility(View.VISIBLE);
		Animation rotateAnim = AnimationUtils
				.loadAnimation(this, R.anim.rotate);
		mCircleProgressbar.startAnimation(rotateAnim);
		jsonObject = new JSONObject();
		JSONArray jsonArray = new JSONArray();
		try {
			jsonObject.put("imgs", jsonArray);
			jsonObject.put("faceid", faceid);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		bottomViewLinear.setVisibility(View.VISIBLE);
		headViewLinear.startAnimation(animationOut);
		bottomViewLinear.startAnimation(animationIN);
		mainHandler.post(mTimeoutRunnable);
	}

	private Runnable mTimeoutRunnable = new Runnable() {
		@Override
		public void run() {
			// 倒计时开始
			if (startTimeout < 0) {
				initDetecteSession();
				if (Util.isDebug || Util.APP_TYPE == Util.TYPE_MEDIARECORDER) {
					mediaRecorderUtil = new MediaRecorderUtil(
							MainActivity.this, mCamera, mSession);
					if (mediaRecorderUtil.prepareVideoRecorder()) {
						mCamera.setPreviewCallback(MainActivity.this);
						mediaRecorderUtil.start();
					} else {
						mDialogUtil.showDialog("录像发生异常，请重新打开！");
					}
				}
				mCircleProgressbar.clearAnimation();
				mTimeoutText.setVisibility(View.INVISIBLE);
				circleMask.setVisibility(View.INVISIBLE);
				if (mIDetection.mDetectionSteps != null)
					changeType(mIDetection.mDetectionSteps.get(0), 10);
				return;
			}

			if (startTimeout > 0) {
				mTimeoutText.setText(startTimeout + "");
			} else {
				mTimeoutText.setText("开始");
			}
			mainHandler.postDelayed(this, 500);
			startTimeout--;
		}
	};

	private void initDetecteSession() {
		if (mICamera.mCamera == null)
			return;

		// mDetector.setDetectionListener(this);
		// mCameraUtil.actionDetecte(this);
		mProgressBar.setVisibility(View.INVISIBLE);

		mIDetection.detectionTypeInit();

		mCurStep = 0;
		mDetector.reset();
		mDetector.changeDetectionType(mIDetection.mDetectionSteps.get(0));
	}

	@Override
	public void onPreviewFrame(byte[] data, Camera camera) {
		// Log.w("ceshi", "onPreviewFrame+++data===" + data);
		Size previewsize = camera.getParameters().getPreviewSize();// }
		mDetector.doDetection(data, previewsize.width, previewsize.height, 360 - mICamera.getCameraAngle(this));
	}

	/**
	 * 实体验证成功
	 */
	@Override
	public DetectionType onDetectionSuccess(final DetectionFrame validFrame) {
		mIMediaPlayer.reset();

		mCurStep++;
		mFaceMask.setFaceInfo(null);

		if (mCurStep >= mIDetection.mDetectionSteps.size()) {

			mProgressBar.setVisibility(View.VISIBLE);
			if (Util.isDebug || Util.APP_TYPE == Util.TYPE_MEDIARECORDER) {
				mediaRecorderUtil.releaseMediaRecorder();
			}
			new Thread(new Runnable() {
				@Override
				public void run() {
					final boolean isSave = mIFile.save(mDetector, mSession,
							jsonObject);
					int index = 0;
					for (DetectionFrame tmpFrame : mDetector.getValidFrame()) {
						index++;
					}
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							if (!isSave) {
								handleResult(R.string.novalidframe);
							} else {
								if (Util.APP_TYPE != Util.TYPE_LIVENESS
										&& Util.APP_TYPE != Util.TYPE_MEDIARECORDER) {
									doRequest(mDetector.getValidFrame());
								} else {
									handleResult(R.string.verify_success);
								}
							}
						}
					});
				}
			}).start();
		} else
			changeType(mIDetection.mDetectionSteps.get(mCurStep), 10);

		// 检测器返回值：如果不希望检测器检测则返回DetectionType.DONE，如果希望检测器检测动作则返回要检测的动作
		return mCurStep >= mIDetection.mDetectionSteps.size() ? DetectionType.DONE
				: mIDetection.mDetectionSteps.get(mCurStep);
	}

	/**
	 * 活体检测失败
	 */
	@Override
	public void onDetectionFailed(final DetectionFailedType type) {
		new Thread(new Runnable() {
			@Override
			public void run() {
				mIFile.saveLog(mSession, type.name());
			}
		}).start();
		if (Util.isDebug || Util.APP_TYPE == Util.TYPE_MEDIARECORDER) {
			mediaRecorderUtil.releaseMediaRecorder();
		}
		int resourceID = R.string.liveness_detection_failed;
		switch (type) {
		case ACTIONBLEND:
			resourceID = R.string.liveness_detection_failed_action_blend;
			break;
		case NOTVIDEO:
			resourceID = R.string.liveness_detection_failed_not_video;
			break;
		case TIMEOUT:
			resourceID = R.string.liveness_detection_failed_timeout;
			break;
		}
		handleResult(resourceID);
	}

	private int faceSuccessTime = 0;

	/**
	 * 活体验证中
	 */
	@Override
	public void onFrameDetected(long timeout, DetectionFrame detectionFrame) {
		FaceInfo faceInfo = detectionFrame.getFaceInfo();
		if (faceInfo != null) {
			float pitch = faceInfo.pitch;
			float yaw = faceInfo.yaw;
			float size = faceInfo.faceQuality;
			if (size > 40) {
				faceSuccessTime++;
				if (faceSuccessTime > 5) {// 必须连续合格超过5帧才允许运行
					handleStart();
				}
			} else {
				faceSuccessTime = 0;
			}
		}
		handleNotPass(timeout);
		mFaceMask.setFaceInfo(detectionFrame);
	}

	/**
	 * 非实体检测时需要网络请求验证
	 */
	private void doRequest(List<DetectionFrame> frames) {
		mProgressBar.setVisibility(View.VISIBLE);

		RequestParams requestParams = new RequestParams();
		requestParams.put("person_name", faceid + "");
		int index = 1;
		for (DetectionFrame tmpFrame : frames) {
			Rect outRect = new Rect();
			byte[] imgData = tmpFrame.getCroppedFaceImageData(outRect);
			// Rect faceSize = tmpFrame.getFaceSize();
			// if (imgData == null || faceSize == null)
			// continue;
			// Log.w("ceshi", "tmpFrame.getFaceQuality()====" + index + ", "
			// + tmpFrame.getFaceQuality());
			String rect = outRect.left + "," + outRect.top + ","
					+ outRect.right + "," + outRect.bottom;
			requestParams.put("rect" + index, rect);
			requestParams.put("img" + index, new ByteArrayInputStream(imgData));
			index++;
		}

		JsonHttpResponseHandler jsonHttpResponseHandler = new JsonHttpResponseHandler() {
			@Override
			public void onSuccess(int statusCode, Header[] headers,
					JSONObject response) {
				super.onSuccess(statusCode, headers, response);
				// Log.w("ceshi", "onSuccess+++===" + response.toString());
				try {
					jsonObject.put("networkResponse", response.toString());
					jsonObject
							.put("verifyTime",
									(System.currentTimeMillis() - mTimeSendRequest) / 1000.0f);
				} catch (JSONException e) {
					e.printStackTrace();
				}
				try {
					if (response.getBoolean("is_same_person")) {
						handleResult(R.string.verify_success);
					} else {
						handleResult(R.string.verify_error);
					}
				} catch (JSONException e) {
					e.printStackTrace();
					handleResult(R.string.verify_error);
				}
			}

			@Override
			public void onFailure(int statusCode, Header[] headers,
					Throwable throwable, JSONObject errorResponse) {
				super.onFailure(statusCode, headers, throwable, errorResponse);
				// Log.w("ceshi", "onFailure+++===" + errorResponse.toString());
				try {
					jsonObject.put("networkResponse",
							errorResponse != null ? errorResponse.toString()
									: "");
				} catch (JSONException e) {
					e.printStackTrace();
				}
				handleResult(R.string.network_error);
			}
		};
		myAsyncHttpClient.post(Util.getVerifyApiURL(), requestParams,
				jsonHttpResponseHandler);
		mTimeSendRequest = System.currentTimeMillis();
	}

	/**
	 * 跳转Activity传递信息
	 */
	private void handleResult(final int resID) {
		String resultString = getResources().getString(resID);
//		try {
//			jsonObject.put("result", resultString);
//			jsonObject.put("resultcode", resID);
//		} catch (JSONException e) {
//			e.printStackTrace();
//		}
		
			
		Intent intent = new Intent();
		
	    intent.putExtra("result",resultString);
		setResult(RESULT_OK, intent);
		
//		if (name != null) {
//			ResultActivity.startActivity(MainActivity.this,
//					jsonObject.toString());
//		}
		finish();
	}

	private int mCurStep = 0;// 检测动作的次数

	public void changeType(final Detector.DetectionType detectiontype,
			long timeout) {
		mIDetection.changeType(detectiontype, timeout, bottomViewLinear);
		mFaceMask.setFaceInfo(null);

//		if (mCurStep == 0) {
//			mIMediaPlayer.doPlay(mIMediaPlayer.getSoundRes(detectiontype));
//		} else {
//			mIMediaPlayer.doPlay(R.raw.next_step);
//			mIMediaPlayer.setOnCompletionListener(detectiontype);
//		}
	}

	public void handleNotPass(final long remainTime) {
		if (remainTime > 0) {
			mainHandler.post(new Runnable() {
				@Override
				public void run() {
					mIDetection.handleNotPass(remainTime);
				}
			});
		}
	}

	private boolean mHasSurface = false;

	@Override
	public void onSurfaceTextureAvailable(SurfaceTexture surface, int width,
			int height) {
		mHasSurface = true;
		doPreview();

		// 添加活体检测回调
		mDetector.setDetectionListener(this);
		mICamera.actionDetect(this);
	}

	@Override
	public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width,
			int height) {
	}

	@Override
	public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
		mHasSurface = false;
		return false;
	}

	@Override
	public void onSurfaceTextureUpdated(SurfaceTexture surface) {
		// long startTime = System.currentTimeMillis();
		// if (mCamera != null) {
		// mCamera.setPreviewCallback(this);
		// }
		// Log.w("ceshi", "time====" + (System.currentTimeMillis() -
		// startTime));
	}

	private void doPreview() {
		if (!mHasSurface)
			return;

		mICamera.startPreview(camerapreview.getSurfaceTexture());
	}

	@Override
	protected void onPause() {
		super.onPause();
//		MobclickAgent.onPause(this);
		mainHandler.removeCallbacksAndMessages(null);
		if (Util.isDebug || Util.APP_TYPE == Util.TYPE_MEDIARECORDER) {
			if (mediaRecorderUtil != null) {
				mediaRecorderUtil.releaseMediaRecorder();
			}
		}
		mICamera.closeCamera();
		mCamera = null;
		mIMediaPlayer.close();

		finish();
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (mDetector != null)
			mDetector.release();
		mDialogUtil.onDestory();
		mIDetection.onDestroy();
	}
}