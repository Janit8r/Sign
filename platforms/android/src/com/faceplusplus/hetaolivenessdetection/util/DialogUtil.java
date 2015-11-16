package com.faceplusplus.hetaolivenessdetection.util;

import com.mybofeng.sign.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.view.WindowManager;
import android.widget.LinearLayout;

public class DialogUtil {

	private Activity activity;

	public DialogUtil(Activity activity) {
		this.activity = activity;
	}

	public void showCamera(final int index) {
		final AlertDialog alertDialog = new AlertDialog.Builder(activity)
				.create();
		//alertDialog.setCancelable(true);
		alertDialog.show();
		LayoutInflater mInflater = (LayoutInflater) activity
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		View comment_view = mInflater
				.inflate(R.layout.dialog_item, null, false);
		Window window = alertDialog.getWindow();
		window.setLayout(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
		window.clearFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);
		window.setContentView(comment_view);

		LinearLayout cameraLinear = (LinearLayout) comment_view
				.findViewById(R.id.dialog_item_cameraLinear);
		cameraLinear.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if (mDoialogUtilListener != null) {
					mDoialogUtilListener.intoCamera(index);
				}
				// 相机
				alertDialog.cancel();
			}
		});

		LinearLayout pictureLinear = (LinearLayout) comment_view
				.findViewById(R.id.dialog_item_pictureLinear);
		pictureLinear.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if (mDoialogUtilListener != null) {
					mDoialogUtilListener.intoPicture(index);
				}
				// 照片
				alertDialog.cancel();
			}
		});

	}

	public void showDialog(String message) {
		AlertDialog alertDialog = new AlertDialog.Builder(activity)
				.setTitle(message)
				.setNegativeButton("确认", new DialogInterface.OnClickListener() {
					@Override
					public void onClick(DialogInterface dialog, int which) {
						activity.finish();
					}
				}).setCancelable(false).create();
		alertDialog.show();
	}

	public void onDestory() {
		activity = null;
	}

	public DoialogCameraListener mDoialogUtilListener;

	public void setDoialogCameraListener(DoialogCameraListener mDoialogUtilListener) {
		this.mDoialogUtilListener = mDoialogUtilListener;
	}

	public interface DoialogCameraListener {
		public void intoCamera(int index);

		public void intoPicture(int index);
	}

}
