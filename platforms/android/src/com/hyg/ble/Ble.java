package com.hyg.ble;

import java.util.List;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import com.neovisionaries.bluetooth.ble.advertising.ADPayloadParser;
import com.neovisionaries.bluetooth.ble.advertising.ADStructure;
import com.neovisionaries.bluetooth.ble.advertising.LocalName;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.location.LocationClientOption.LocationMode;

public class Ble extends CordovaPlugin {

	//
	
	private BluetoothAdapter mBluetoothAdapter;
	private boolean mScanning;
	private Handler mHandler = new Handler();
	private String _name = null;
	private float _lat=0;
	private float _lng=0;
	private CallbackContext _context;
	Runnable r = new Runnable() {
	
		@SuppressWarnings("deprecation")
		@Override
		public void run() {
			mScanning = false;
			//mBluetoothAdapter.stopLeScan(mLeScanCallback);
			PluginResult r = new PluginResult(PluginResult.Status.OK, "{\"result\":\"false\",\"type\":\"blue\"}");
			r.setKeepCallback(true);

			_context.sendPluginResult(r);
		}
	};
	public LocationClient mLocationClient = null;
	
	
	private void initLocation() {
		LocationClientOption option = new LocationClientOption();
		option.setLocationMode(LocationMode.Hight_Accuracy);// 可选，默认高精度，设置定位模式，高精度，低功耗，仅设备
		option.setCoorType("bd09ll");// 可选，默认gcj02，设置返回的定位结果坐标系

		option.setOpenGps(true);// 可选，默认false,设置是否使用gps

		mLocationClient.setLocOption(option);
	}

	

	static double DEF_PI = 3.14159265359; 
		static double DEF_2PI= 6.28318530712; 
		static double DEF_PI180= 0.01745329252;
		static double DEF_R =6370693.5; 
	public static double GetShortDistance(double lon1, double lat1, double lon2, double lat2)	{	
			double ew1, ns1, ew2, ns2;		double dx, dy, dew;		double distance;		// 角度转换为弧度	
			ew1 = lon1 * DEF_PI180;		ns1 = lat1 * DEF_PI180;		ew2 = lon2 * DEF_PI180;		
			ns2 = lat2 * DEF_PI180;		// 经度差		
			dew = ew1 - ew2;		// 若跨东经和西经180 度，进行调整	
			if (dew > DEF_PI)		dew = DEF_2PI - dew;	
			else if (dew < -DEF_PI)		dew = DEF_2PI + dew;		
			dx = DEF_R * Math.cos(ns1) * dew; // 东西方向长度(在纬度圈上的投影长度)	
			dy = DEF_R * (ns1 - ns2); // 南北方向长度(在经度圈上的投影长度)		// 勾股定理求斜边长		
			distance = Math.sqrt(dx * dx + dy * dy);	
			return distance;	
			}
	@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
    private void ScanBlue(){
    	 BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {
				
				@Override
				public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
					List<ADStructure> structures = ADPayloadParser.getInstance().parse(scanRecord);
					for (int i = 0; i < structures.size(); i++) {
						if (structures.get(i).getType() == 9) {
							LocalName name = (LocalName) structures.get(i);
							if (name.getLocalName().equals(_name)) {
								mHandler.removeCallbacks(r);
								PluginResult rr = new PluginResult(PluginResult.Status.OK,
										"{\"result\":\"success\",\"type\":\"blue\"}");
								rr.setKeepCallback(true);
								mBluetoothAdapter.stopLeScan(this);
								_context.sendPluginResult(rr);
							}
						}
					}
				}
			};
			
			//
			mScanning = true;
			// 蓝牙定位
			if (cordova.getActivity().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
				//
				BluetoothManager bluetoothManager = (BluetoothManager) cordova.getActivity()
						.getSystemService(Context.BLUETOOTH_SERVICE);
				mBluetoothAdapter = bluetoothManager.getAdapter();

				if (mBluetoothAdapter != null) {
					if (mBluetoothAdapter.isEnabled() == false) {
						PluginResult rr = new PluginResult(PluginResult.Status.OK,
								"{\"result\":\"fail\",\"type\":\"blue\"}");
						rr.setKeepCallback(true);
						_context.sendPluginResult(rr);
						Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
						cordova.getActivity().startActivityForResult(enableBtIntent, 2);
					
					} else {
						mHandler.postDelayed(r, 10000);
						if(Build.VERSION.SDK_INT >=Build.VERSION_CODES.JELLY_BEAN_MR2){
							mBluetoothAdapter.startLeScan(mLeScanCallback);
						}
					}
				} else {
					PluginResult rr = new PluginResult(PluginResult.Status.OK,
							"{\"result\":\"fail\",\"type\":\"blue\"}");
					rr.setKeepCallback(true);
					_context.sendPluginResult(rr);
				}
				//
			} else {
				PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"fail\",\"type:\"blue\"}");
				rr.setKeepCallback(true);
				_context.sendPluginResult(rr);
			}
    }
	@Override
	public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
		_context = callbackContext;

		if (action.equals("scanGps")) {
			
			_lat = Float.parseFloat(data.getString(0));
			_lng = Float.parseFloat(data.getString(1));
		

		
			mLocationClient = new LocationClient(cordova.getActivity().getApplicationContext()); // 声明LocationClient类
			mLocationClient.registerLocationListener(new  BDLocationListener (){

				@Override
				public void onReceiveLocation(BDLocation location) {
					// Receive Location
					switch (location.getLocType()) {
					case BDLocation.TypeGpsLocation:
					case BDLocation.TypeNetWorkLocation:
					case BDLocation.TypeOffLineLocation:
						mLocationClient.stop();
						
						float dis = (float) GetShortDistance((float)location.getLongitude(),(float)location.getLatitude(),_lng,_lat);
						if(dis <100)
						{
							PluginResult rrk = new PluginResult(PluginResult.Status.OK,"{\"result\":\"success\"}");
							rrk.setKeepCallback(true);
							_context.sendPluginResult(rrk);
						}else
						{
							PluginResult rrk = new PluginResult(PluginResult.Status.OK,"{\"result\":\"fail\",\"msg\":\"你不在所规定的地点签到,如果你确实在规定的地点，请到室外进行签到\"}");
							rrk.setKeepCallback(true);
							_context.sendPluginResult(rrk);
						}
						
						break;
					case BDLocation.TypeServerError:
					case BDLocation.TypeNetWorkException:
					case BDLocation.TypeCriteriaException:

						PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"fail\",\"type\":\"gps\",\"msg\":\"获取位置不准许,请充许打开系统的位置许可\"}");
						rr.setKeepCallback(true);
						_context.sendPluginResult(rr);

						break;
					default:
						break;
					}
					_context=null;
				}
			});
			initLocation();
			mLocationClient.start();
		}
		if (action.equals("supportBle")) {
			
			PackageManager pm = cordova.getActivity().getApplicationContext().getPackageManager();
			 if(Build.VERSION.SDK_INT >=18){
				 PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"ble\"}");
					rr.setKeepCallback(true);
					
					_context.sendPluginResult(rr);
			 }else
			 {
				 PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"gps\"}");
					rr.setKeepCallback(true);
					_context.sendPluginResult(rr);
			 }
			 
			 _context = null;

		}
		
		if (action.equals("exit")) {
			System.exit(0);
		}
		if(action.equals("getlevel"))
		{
			 PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"level\":\""+android.os.Build.VERSION.SDK_INT+"\"}");
				rr.setKeepCallback(true);
				_context.sendPluginResult(rr);
		
		}
		if (action.equals("scanBlue")) {
			_name = data.getString(0);
			this.ScanBlue();
			
		} 
		
		return true;
		
	}
}
