setup:
	@ pip3 install virtualenv && virtualenv mes-proto-python && source ./mes-proto-python/bin/activate && pip install -r requirements.txt

generate:
	@ source ./mes-proto-python/bin/activate && mkdir -p mes_proto_python && cd mes_proto_python && mkdir -p auto_gen && protoc -I=../.. --python_out=./auto_gen offers.proto && cd auto_gen && echo "" >> __init__.py