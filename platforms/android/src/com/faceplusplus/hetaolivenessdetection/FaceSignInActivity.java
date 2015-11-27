package com.faceplusplus.hetaolivenessdetection;

import java.io.File;
import java.io.FileNotFoundException;

import org.apache.http.Header;
import org.json.JSONException;
import org.json.JSONObject;

import com.faceplusplus.hetaolivenessdetection.util.ConUtil;
import com.faceplusplus.hetaolivenessdetection.util.Constant;
import com.faceplusplus.hetaolivenessdetection.util.DialogUtil;
import com.faceplusplus.hetaolivenessdetection.util.SharedUtil;
import com.faceplusplus.hetaolivenessdetection.util.Util;
import com.mybofeng.sign.R;
import com.faceplusplus.hetaolivenessdetection.util.DialogUtil.DoialogCameraListener;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.nostra13.universalimageloader.core.DisplayImageOptions;
import com.nostra13.universalimageloader.core.ImageLoader;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;

public class FaceSignInActivity extends Activity implements OnClickListener,
		DoialogCameraListener {

	private String mImagePath;
	private ImageView mImageView;
	private ProgressBar mBar;
	private DialogUtil mDialogUtil;
	private String cameraPhotoPath;
	private DisplayImageOptions options;
	private AsyncHttpClient mAsyncHttpclient;
	private EditText mEditText;
	private SharedUtil mSharedUtil;
   private String mName;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.facesignin_layout);

		init();
	}
	
	private void init() {
		mName = getIntent().getStringExtra(Constant.KEY_NAME);
		mSharedUtil = new SharedUtil(this);
		mAsyncHttpclient = new AsyncHttpClient();
		this.options = new DisplayImageOptions.Builder()
				.showImageOnLoading(R.drawable.bg_nothing)
				.showImageForEmptyUri(R.drawable.bg_nothing)
				.showImageOnFail(R.drawable.bg_nothing).cacheInMemory(true)
				.cacheOnDisc(true).considerExifParams(true)
				.bitmapConfig(Bitmap.Config.ARGB_8888).build();
		mDialogUtil = new DialogUtil(this);
		mDialogUtil.setDoialogCameraListener(this);
		
		mImageView = (ImageView) findViewById(R.id.facesignin_layout_image);
		mBar = (ProgressBar) findViewById(R.id.facesignin_layout_progressbar);
		findViewById(R.id.facesignin_layout_rootRel).setOnClickListener(this);
		findViewById(R.id.facesignin_layout_imageRel).setOnClickListener(this);
		findViewById(R.id.facesignin_layout_shibieBtn).setOnClickListener(this);
		
		findViewById(R.id.facesignin_layout_returnBtn).setOnClickListener(this);
	}

	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.facesignin_layout_rootRel:
			ConUtil.isGoneKeyBoard(FaceSignInActivity.this);
			break;
		case R.id.facesignin_layout_imageRel:
			mDialogUtil.showCamera(0);
			break;
		case R.id.facesignin_layout_shibieBtn:
			if (mImagePath != null) {
				mBar.setVisibility(View.VISIBLE);
				try {
					RequestParams rParams = new RequestParams();
					rParams.put("img", new File(mImagePath));
					Log.w("ceshi", "personName===" + mName);
					rParams.put("person_name", mName);
					onRequest(Util.getRegApiURL(), rParams);
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				}
			} else {
				AlertDialog.Builder builder = new Builder(FaceSignInActivity.this);
				builder.setMessage("请拍摄头像再识别");
				builder.setTitle("错误");
				builder.setPositiveButton("OK", null);
				builder.create().show();
			
			}
			break;
		
		case R.id.facesignin_layout_returnBtn:
			FaceSignInActivity.this.finish();
			break;

		}
	}

	@Override
	protected void onPause() {
		super.onPause();
		mImageView.setImageResource(R.drawable.bg_nothing);
		mImagePath = null;
	}

	/**
	 * 上传照片，数据
	 */
	public void onRequest(String url, RequestParams rParams) {
		mAsyncHttpclient.post(url, rParams, new AsyncHttpResponseHandler() {
			@Override
			public void onSuccess(int statusCode, Header[] headers,
					byte[] responseByte) {
				mBar.setVisibility(View.GONE);
				String successStr = new String(responseByte);
				Log.w("ceshi", "successStr===" + successStr);
				try {
					JSONObject response = new JSONObject(successStr);
					if (response.has("success")
							&& response.getBoolean("success")) {
						String resPersonName = response
								.getString("person_name");
						mSharedUtil
						.saveStringValue(Constant.KEY_PERSONNAME, resPersonName);
//						ConUtil.showToast(FaceSignInActivity.this, "上传成功！");
//						Intent intent = new Intent(FaceSignInActivity.this,
//								MainActivity.class);
//						intent.putExtra("faceid", resPersonName);
//						intent.putExtra("name", resPersonName);
//						startActivity(intent);
						 
						  Intent intent = new Intent("android.intent.action.MY_BROADCAST");
						  intent.putExtra("result", "success");
						  intent.putExtra("imagePath", mImagePath);
						   
						    sendBroadcast(intent);  
							finish();
						    
					} else {
						 Intent intent = new Intent("android.intent.action.MY_BROADCAST");
						  intent.putExtra("result", response.getString("error"));
						   
						    sendBroadcast(intent);  
							finish();
					
						
						
					}
				} catch (Exception e) {
					 Intent intent = new Intent("android.intent.action.MY_BROADCAST");
					  intent.putExtra("result","照片不合格，请重新拍摄");
					  
					  sendBroadcast(intent);  
					finish();
					
					
					
				}
			}

			@Override
			public void onFailure(int statusCode, Header[] headers,
					byte[] responseBody, Throwable error) {
				mBar.setVisibility(View.GONE);
				 Intent intent = new Intent("android.intent.action.MY_BROADCAST");
				  intent.putExtra("result","无法识别人脸,请确保在明亮的环境下进行注册");
				   
				  sendBroadcast(intent);  
				finish();

				
			}
		});
	}

	private static final int SELECT_PHOTO = 100;// 选择一张照片时用到
	private static final int SELECT_CAMERO = 101;// 照相时用到

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		if (resultCode == RESULT_OK) {
			switch (requestCode) {
			case SELECT_PHOTO:
				Uri selectedImage = data.getData();
				if (selectedImage == null) {
					return;
				}
				String[] filePathColumn = { MediaStore.Images.Media.DATA };
				if (selectedImage != null && filePathColumn != null) {
					Cursor cursor = getContentResolver().query(selectedImage,
							filePathColumn, null, null, null);
					if (cursor == null) {
						return;
					}
					if (cursor.moveToFirst()) {
						int columnIndex = cursor
								.getColumnIndex(filePathColumn[0]);
						final String filePath = cursor.getString(columnIndex);
						showImage(filePath);
					}
					cursor.close();
				}
				break;
			case SELECT_CAMERO:
				if (cameraPhotoPath != null) {
					showImage(cameraPhotoPath);
				} else {
					ConUtil.showToast(FaceSignInActivity.this, "未找到图片，请重新选取照片");
				}

				break;
			}
		}
	}

	private void showImage(final String imagePath) {
		new Thread(new Runnable() {
			@Override
			public void run() {
				FaceSignInActivity.this.mImagePath = ConUtil.saveBitmap(
						FaceSignInActivity.this, ConUtil.getBitmapConsiderExif(imagePath));// 保存bitmap到文件夹
			}
		}).start();

		ImageLoader.getInstance().displayImage("file://" + imagePath,
				mImageView, options);
	}

	@Override
	public void intoCamera(int index) {
		cameraPhotoPath = null;
		Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
		File mediaFile = ConUtil.getOutputMediaFile(this);
		cameraPhotoPath = mediaFile.getAbsolutePath();
		Uri fileUri = Uri.fromFile(mediaFile);
		intent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri);
		startActivityForResult(intent, SELECT_CAMERO);
	}

	@Override
	public void intoPicture(int index) {
		Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
		photoPickerIntent.setType("image/*");
		startActivityForResult(photoPickerIntent, SELECT_PHOTO);
	}
}
