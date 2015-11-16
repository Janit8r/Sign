package com.faceplusplus.hetaolivenessdetection;

import android.animation.Animator;
import android.animation.ObjectAnimator;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.faceplusplus.hetaolivenessdetection.util.Constant;
import com.faceplusplus.hetaolivenessdetection.util.Util;
import com.faceplusplus.hetaolivenessdetection.view.RotaterView;
import com.mybofeng.sign.R;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.imageaware.ImageAware;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by binghezhouke on 14-10-24.
 */
public class ResultActivity extends Activity implements View.OnClickListener {
	private TextView textView;
	private ImageView mImageView;
	private LinearLayout imageLinear;

	private View mNext;
	private View mRedoLivnessDetection;
	private TextView infoText;

	private String sessionPersonName;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_result);
		init();
	}

	private void init() {
		mImageView = (ImageView) findViewById(R.id.result_status);
		textView = (TextView) findViewById(R.id.result_text_result);
		imageLinear = (LinearLayout) findViewById(R.id.activity_result_imageLinear);
		mNext = findViewById(R.id.result_next);
		mNext.setOnClickListener(this);
		infoText = (TextView) findViewById(R.id.result_infoText);
		mRedoLivnessDetection = findViewById(R.id.result_redolivenessdetection);
		mRedoLivnessDetection.setOnClickListener(this);
		String resultOBJ = getIntent().getStringExtra("result");

		if (Util.APP_TYPE != Util.TYPE_REG) {
			mRedoLivnessDetection.setVisibility(View.GONE);
		}
		if (Util.APP_TYPE == Util.TYPE_SFZREG) {
			imageLinear.setVisibility(View.VISIBLE);
			if (Constant.SFZ_BEAN != null) {
				String infoStr = "姓名: " + Constant.SFZ_BEAN.name + "  民族: "
						+ Constant.SFZ_BEAN.race + "  性别: "
						+ Constant.SFZ_BEAN.gender + "\n地址: "
						+ Constant.SFZ_BEAN.address + "\n生日: "
						+ Constant.SFZ_BEAN.birthday + "\n号码: "
						+ Constant.SFZ_BEAN.id_card_number;
				infoText.setText(infoStr);
			} else {
				String infoStr = "姓名: " + " " + "  民族: " + " " + "  性别: " + " "
						+ "\n地址: " + " " + "\n生日: " + " " + "\n号码: " + " ";
				infoText.setText(infoStr);
			}
		}

		try {
			JSONObject result = new JSONObject(resultOBJ);
			textView.setText(result.getString("result"));

			int resID = result.getInt("resultcode");
//			switch (resID) {
//			case R.string.verify_success:
//				doPlay(R.raw.success);
//				break;
//			case R.string.liveness_detection_failed_not_video:
//				doPlay(R.raw.failed_actionblend);
//				break;
//			case R.string.liveness_detection_failed_timeout:
//				doPlay(R.raw.failed_timeout);
//				break;
//			case R.string.liveness_detection_failed:
//				doPlay(R.raw.failed);
//				break;
//			default:
//				doPlay(R.raw.failed);
//				break;
//			}

			boolean isSuccess = result.getString("result").equals(
					getResources().getString(R.string.verify_success));
			mImageView.setImageResource(isSuccess ? R.drawable.result_success
					: R.drawable.result_failded);
			doRotate(isSuccess);

			JSONArray jsonArray = result.getJSONArray("imgs");
			int[] ivIds = { R.id.result_img1, R.id.result_img2,
					R.id.result_img3 };

			for (int i = 0; i < ivIds.length && i < jsonArray.length(); i++) {
				ImageView imageView = (ImageView) findViewById(ivIds[i]);

				if (i < 2) {
					String imgPath = jsonArray.getString(i);
					if (i == 1 && Constant.SFZ_BEAN != null) {
						imgPath = Constant.SFZ_BEAN.headImagePath;
					}
					ImageLoader.getInstance().displayImage("file://" + imgPath,
							imageView);
					imageView.setVisibility(View.VISIBLE);
				}
			}

			if (jsonArray.length() == 0 && Constant.SFZ_BEAN != null) {
				ImageView image2 = (ImageView) findViewById(R.id.result_img2);
				ImageLoader.getInstance().displayImage(
						"file://" + Constant.SFZ_BEAN.headImagePath, image2);
			}

			sessionPersonName = result.getString("faceid");
		} catch (JSONException e) {
			mRedoLivnessDetection.setVisibility(View.INVISIBLE);
			e.printStackTrace();
		}
	}

	@Override
	public void onBackPressed() {
		super.onBackPressed();
		Intent intent = new Intent(this, com.mybofeng.sign.MainActivity.class);
		startActivity(intent);
	}

	public static void startActivity(Context context, String status) {
		Intent intent = new Intent(context, ResultActivity.class);
		intent.putExtra("result", status);
		context.startActivity(intent);
	}

	@Override
	public void onClick(View view) {
		switch (view.getId()) {
		case R.id.result_next: {
//			Intent intent = new Intent(this, LoadingActivity.class);
//			startActivity(intent);
		}
			break;
		case R.id.result_redolivenessdetection:
			Intent intent = new Intent(this, MainActivity.class);
			intent.putExtra("name", sessionPersonName);
			intent.putExtra("faceid", sessionPersonName);
			startActivity(intent);
			finish();
			break;
		}
	}

	private void doRotate(boolean success) {
		RotaterView rotaterView = (RotaterView) findViewById(R.id.result_rotater);
		rotaterView.setColour(success ? 0xff4ae8ab : 0xfffe8c92);
		final ImageView statusView = (ImageView) findViewById(R.id.result_status);
		statusView.setVisibility(View.INVISIBLE);
		statusView.setImageResource(success ? R.drawable.result_success
				: R.drawable.result_failded);

		ObjectAnimator objectAnimator = ObjectAnimator.ofInt(rotaterView,
				"progress", 0, 100);
		objectAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
		objectAnimator.setDuration(600);
		objectAnimator.addListener(new Animator.AnimatorListener() {
			@Override
			public void onAnimationStart(Animator animation) {

			}

			@Override
			public void onAnimationEnd(Animator animation) {
				Animation scaleanimation = AnimationUtils.loadAnimation(
						ResultActivity.this, R.anim.scaleoutin);
				statusView.startAnimation(scaleanimation);
				statusView.setVisibility(View.VISIBLE);
			}

			@Override
			public void onAnimationCancel(Animator animation) {

			}

			@Override
			public void onAnimationRepeat(Animator animation) {

			}
		});
		objectAnimator.start();
	}

	private MediaPlayer mMediaPlayer = null;

	private void doPlay(int rawId) {
		if (mMediaPlayer == null)
			mMediaPlayer = new MediaPlayer();

		mMediaPlayer.reset();
		try {
			AssetFileDescriptor localAssetFileDescriptor = getResources()
					.openRawResourceFd(rawId);
			mMediaPlayer.setDataSource(
					localAssetFileDescriptor.getFileDescriptor(),
					localAssetFileDescriptor.getStartOffset(),
					localAssetFileDescriptor.getLength());
			mMediaPlayer.prepare();
			mMediaPlayer.start();
		} catch (Exception localIOException) {
			localIOException.printStackTrace();
		}
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (mMediaPlayer != null) {
			mMediaPlayer.reset();
			mMediaPlayer.release();
		}
	}
}