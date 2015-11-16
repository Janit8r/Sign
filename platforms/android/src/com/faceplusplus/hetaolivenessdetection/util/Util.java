package com.faceplusplus.hetaolivenessdetection.util;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.hardware.Camera;
import android.util.Log;

public class Util {

	public static String API_HOST = "http://101.251.235.126:8008";
	public static String API_KEY = "test";
	public static String API_SECRET = "test";
    
	private static final String REG_API = "/person/create";
	private static final String VERIFY_API = "/person/verify";
	private static final String INFO_API = "/person/info";
	private static final String FACE_API = "/face/detect";
//	public static final String FACE_EXTRACT = API_HOST + "/face/extract";
//	public static final String FACE_COMPARE = API_HOST + "/face/compare";

	public static void copyModels(Context context) {
		File dstModelFile = new File(context.getExternalFilesDir(null), "model");
		if (dstModelFile.exists()) {
			return;
		}

		try {
			String tmpFile = "model";
			BufferedInputStream inputStream = new BufferedInputStream(context
					.getAssets().open(tmpFile));
			BufferedOutputStream foutputStream = new BufferedOutputStream(
					new FileOutputStream(dstModelFile));

			byte[] buffer = new byte[1024];
			int readcount = -1;
			while ((readcount = inputStream.read(buffer)) != -1) {
				foutputStream.write(buffer, 0, readcount);
			}
			foutputStream.close();
			inputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 获取相机分辨率
	 */
	public static Camera.Size getBestPrevewSize(
			List<Camera.Size> supportedPreviewSize, final int screen_width,
			final int screen_height) {

		Log.e("diff", "screen_width:" + screen_width + "screen_height:"
				+ screen_height);
		ArrayList<Camera.Size> usefulList = new ArrayList<Camera.Size>();

		float min_diff = Float.MAX_VALUE;
		for (Camera.Size tmpSize : supportedPreviewSize) {
			if (tmpSize.width > tmpSize.height) {
				usefulList.add(tmpSize);
				float diff = Math
						.abs((tmpSize.width * 1.0f / tmpSize.height - screen_width
								* 1.0f / screen_height));
				if (min_diff > diff)
					min_diff = diff;
			}
		}

		ArrayList<Camera.Size> equalRatioList = new ArrayList<Camera.Size>();
		for (Camera.Size tmpSize : usefulList) {
			float diff = Math
					.abs((tmpSize.width * 1.0f / tmpSize.height - screen_width
							* 1.0f / screen_height));
			if (min_diff == diff) {
				// if (tmpSize.width < 1000 || tmpSize.height < 1000)
				// return tmpSize;
				equalRatioList.add(tmpSize);
			}
		}

		// Collections.sort(equalRatioList, new Comparator<Camera.Size>() {
		// @Override
		// public int compare(Camera.Size lhs, Camera.Size rhs) {
		// int first = Math.abs((lhs.width * lhs.height) - (screen_height *
		// screen_width));
		// int second = Math.abs((rhs.width * rhs.height) - (screen_height *
		// screen_width));
		// return first - second;
		// }
		// });
		for (Camera.Size tmpSize : equalRatioList) {
			Log.e("diff", "usefulelist:" + tmpSize.width + " _"
					+ tmpSize.height);
			if (tmpSize.height < 1000 || tmpSize.width < 1000)
				return tmpSize;
		}
		return equalRatioList.get(0);
	}
	
	public static String getFaceExtractURL() {
		return API_HOST + "/face/extract";
	}
	
	public static String getFaceCompareURL() {
		return API_HOST + "/face/compare";
	}

	private static String getApiURL(String api) {
		return API_HOST + api + "?api_key=" + API_KEY + "&api_secret="
				+ API_SECRET;
	}

	public static String getVerifyApiURL() {
		return getApiURL(VERIFY_API);
	}

	public static String getInfoApi() {
//		return API_HOST + INFO_API;
		return getApiURL(INFO_API);
	}

	public static String getRegApiURL() {
		return getApiURL(REG_API);
	}

	public static byte[] readModel(Context context) {
		InputStream inputStream = null;
		ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int count = -1;
		try {
			inputStream = context.getAssets().open("model");
			while ((count = inputStream.read(buffer)) != -1) {
				byteArrayOutputStream.write(buffer, 0, count);
			}
			byteArrayOutputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return byteArrayOutputStream.toByteArray();
	}

	public static final int TYPE_LIVENESS = 1;// 实体检测，名字是默认的
	public static final int TYPE_INPUT = 2;// 需要填写姓名（这个姓名必须是list中的姓名）
	public static final int TYPE_REG = 3;// 现场拍照片现场活体检测
	public static final int TYPE_PHOTOCHECK = 4;// 没有活体的人脸验证
	public static final int TYPE_MEDIARECORDER = 5;// 录视频
	public static final int TYPE_SFZREG = 6;// 获取身份证信息

	public static int APP_TYPE = TYPE_LIVENESS;

	public static boolean isDebug = false;// 是否打开调试模式
}