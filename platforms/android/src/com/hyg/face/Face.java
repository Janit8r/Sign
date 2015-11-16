package com.hyg.face;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.apache.cordova.*;
import org.apache.http.Header;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.faceplusplus.hetaolivenessdetection.FaceSignInActivity;
import com.faceplusplus.hetaolivenessdetection.MainActivity;
import com.faceplusplus.hetaolivenessdetection.util.Util;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.JsonHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.megvii.livenessdetection.DetectionFrame;
import com.mybofeng.sign.R;

import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.view.View;

public class Face extends CordovaPlugin {
	 CallbackContext context ;
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
	    switch (requestCode) {
	    case 1: //integer matching the integer suplied when starting the activity
	         if(resultCode == android.app.Activity.RESULT_OK){
	             //in case of success return the string to javascript
	             String result=intent.getStringExtra("result"); 
	             String imagePath=intent.getStringExtra("imagePath");
	             this.context.success("{\"op\":\"regiser\",\"result\":\"success\",\"imagePath\":\""+imagePath+"\"}");
	         }
	        
	         else{
	             this.context.success("{\"op\":\"regiser\",\"result\":\"fail\"}");
	         }
	         break;
	    case 2:
	    	 if(resultCode == android.app.Activity.RESULT_OK){
	             //in case of success return the string to javascript
	             String result=intent.getStringExtra("result"); 
	           
	             this.context.success("{\"op\":\"verify\",\"result\":\""+result+"\"}");
	         }
	         
	         
	    	break;
	    default:
	         break;
	    }
	}
	private void doRequest(String name) {
		
		RequestParams requestParams = new RequestParams();
		requestParams.put("person_name", name + "");
		int index = 1;
		
		final JSONObject jsonObject;
		AsyncHttpClient myAsyncHttpClient = new AsyncHttpClient();
		JsonHttpResponseHandler jsonHttpResponseHandler = new JsonHttpResponseHandler() {
			@Override
			public void onSuccess(int statusCode, Header[] headers,
					JSONObject response) {
				super.onSuccess(statusCode, headers, response);
				try {
					if(response.getBoolean("success"))
					// Log.w("ceshi", "onSuccess+++===" + response.toString());
					Face.this.context.success("{\"op\":\"search\",\"result\":\"success\"}");
					else
						Face.this.context.success("{\"op\":\"search\",\"result\":\"fail\"}");
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				//
			}

			@Override
			public void onFailure(int statusCode, Header[] headers,
					Throwable throwable, JSONObject errorResponse) {
				super.onFailure(statusCode, headers, throwable, errorResponse);
				Face.this.context.success("{op:'search',result:'fail'}");
				// Log.w("ceshi", "onFailure+++===" + errorResponse.toString());
				
			}
		};
		myAsyncHttpClient.post(Util.getInfoApi(), requestParams,
				jsonHttpResponseHandler);
		
	}
    @Override
    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
    	context = callbackContext;
    	if(action.equals("search"))
    {
    		//
    		final String name = data.getString(0);
       		this.doRequest(name);
    }
    else if(action.equals("register"))
    	{
    		//
    	 final String name = data.getString(0);
    		Context context =  cordova.getActivity().getApplicationContext();
    	
    		Intent intent = new Intent(cordova.getActivity(),FaceSignInActivity.class);
    		intent.putExtra("name", name);
    		cordova.startActivityForResult(this, intent,1);
    		//
    	}
    	
    else if(action.equals("verify")){
    	 final String name = data.getString(0);
    	Context context =  cordova.getActivity().getApplicationContext();
		Intent intent = new Intent(context,MainActivity.class);
		intent.putExtra("name",name);
		intent.putExtra("faceid",name);
		cordova.startActivityForResult(this, intent,2);
    }
    return true;
    }
}
    