using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace SignalRDemoApp.Hubs
{
    public class DrawingBoard : Hub
    {
        private static int _boardWidth = 500;
        private static int _boardHeight = 500;
        
        // static variable as distributed storage :)
        private static int[,] _buffer = GetEmptyBuffer();

        #region Hub Public Methods
        public Task BroadcastPoint(int x, int y)
        {
            HandleBorderOverstepping(ref x, ref y);

            // Parsing selected color from client state
            int colorId = ParseColorId(Clients.Caller.color);

            _buffer[x, y] = colorId;

            return Clients.Others.DrawPoint(x, y, Clients.Caller.color);
        }

        public Task BroadcastClear()
        {
            _buffer = GetEmptyBuffer();
            return Clients.Others.Clear();
        }

        #endregion
        
        #region Hub service methods
        public override Task OnConnected()
        {
            return Clients.Caller.Update(_buffer);
        }

        #endregion

        #region Private Methods
        private int ParseColorId(dynamic color)
        {
            int colorId;
            int.TryParse(color, out colorId);

            return colorId;
        }

        private static int[,] GetEmptyBuffer()
        {
            var buffer = new int[_boardWidth, _boardHeight];
            return buffer;
        }
        private static void HandleBorderOverstepping(ref int x, ref int y)
        {
            if (x < 0)
            {
                x = 0;
            }
            if (x >= _boardWidth)
            {
                x = _boardWidth - 1;
            }
            if (y < 0)
            {
                y = 0;
            }
            if (y >= _boardHeight)
            {
                y = _boardHeight - 1;
            }
        }

        #endregion


    }
}